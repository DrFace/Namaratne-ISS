import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

export interface QueryParams {
  page?: number;
  search?: string;
  per_page?: number;
  [key: string]: any;
}

export const useEntities = <T>(entityName: string, endpoint: string, params: QueryParams = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [entityName, params],
    queryFn: async () => {
      const { data } = await axios.get(endpoint, { params });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newEntity: Partial<T>) => {
      const { data } = await axios.post(endpoint, newEntity);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success(`${entityName} created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to create ${entityName}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string | number; data: Partial<T> }) => {
      const { data } = await axios.put(`${endpoint}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success(`${entityName} updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to update ${entityName}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await axios.delete(`${endpoint}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
      toast.success(`${entityName} deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to delete ${entityName}`);
    },
  });

  return {
    ...query,
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
  };
};
