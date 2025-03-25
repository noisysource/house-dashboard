import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { CreateDeviceInput, UpdateDeviceInput } from "../graphql/inputTypes";
import { CREATE_DEVICE, DELETE_DEVICE, GET_DEVICES, UPDATE_DEVICE, GET_DEVICE } from "../graphql/queries/deviceQueries";

export const useDevices = () => {
    // Fetch all devices
    const { data, loading, error, refetch } = useQuery(GET_DEVICES);

    // Lazy query for fetching a single device by ID (only runs when called)
    const [fetchDeviceById, { data: singleDeviceData, loading: singleDeviceLoading, error: singleDeviceError }] =
        useLazyQuery(GET_DEVICE);

    // Create device mutation
    const [createDevice] = useMutation(CREATE_DEVICE, {
        onCompleted: () => refetch()
    });

    // Update device mutation
    const [updateDevice] = useMutation(UPDATE_DEVICE, {
        onCompleted: () => refetch()
    });

    // Delete device mutation
    const [deleteDevice] = useMutation(DELETE_DEVICE, {
        onCompleted: () => refetch(),
    });

    return {
        devices: data?.deviceMany || [],
        loading,
        error,
        refetch,
        fetchDeviceById,
        singleDevice: singleDeviceData?.deviceById || null,
        singleDeviceLoading,
        singleDeviceError,
        createDevice: async (deviceInput: CreateDeviceInput) => {
            await createDevice(
                {
                    variables:
                    {
                        name: deviceInput.name,
                        ipAddress: deviceInput.ipAddress,
                        type: deviceInput.type
                    }
                }
            );
        },
        updateDevice: async (id: string, deviceInput: UpdateDeviceInput) => {
            await updateDevice({ variables: { id, input: deviceInput } });
        },
        deleteDevice: async (id: string) => {
            await deleteDevice({ variables: { id } });
        },
    };
};