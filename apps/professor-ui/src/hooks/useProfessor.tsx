import {useQuery} from '@tanstack/react-query';
import axiosInstance from "../utils/axiosInstance";

const fetchProfessor = async () => {
    const response = await axiosInstance.get('/api/logged-in-professor');
    return response.data.professor;
};
const useProfessor = (enabled: boolean = true) => {
    const {
        data: professor,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['professor'],
        queryFn: fetchProfessor,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        enabled
    });
    return {professor, isLoading, isError, refetch};
};
export default useProfessor;
