import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsClient } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';
import { EventListAllResponse } from '@/dto/event-doc.dto';
import { SHOW_QUERY_KEYS } from './useShowQueries';

export const EVENT_QUERY_KEYS = {
  list: 'eventList',
  detail: 'eventDetail',
  show: 'eventShow',
  setting: 'eventSetting',
  payment: 'eventPayment',
};

interface EventListParams {
  keyword?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const useGetEventList = (params: EventListParams) => {
  return useQuery<
    { docs: EventListAllResponse[]; totalDocs: number },
    AxiosError
  >({
    queryKey: [EVENT_QUERY_KEYS.list, params],
    queryFn: async () => {
      const data = await eventsClient.getList(params);
      return data;
    },
  });
};

export const useEventMutations = (eventId?: IdParam) => {
  const queryClient = useQueryClient();

  const infoDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      let categoryIds = data?.categoriesIds;
      let categories = data?.categories;
      if (data.category) {
        const [categoryId, category] = data.category.split('_');
        categoryIds = [categoryId];
        categories = [category];
        delete data.category;
      }
      delete data.setting;
      delete data.paymentInfo;
      delete data.shows;
      return await eventsClient.createDraft({
        ...data,
        categoriesIds: categoryIds,
        categories: categories,
        id: eventId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEYS.detail, eventId],
      });
    },
  });

  const showMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!eventId) throw new Error('Event ID is required');
      return await eventsClient.updateShow(eventId, data);
    },
    onSuccess: () => {
      // Invalidate both query keys to ensure cache consistency
      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEYS.show, eventId],
      });
      queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.list, eventId], // This matches SHOW_QUERY_KEYS.list
      });
    },
  });

  const settingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!eventId) throw new Error('Event ID is required');
      return await eventsClient.updateSetting(eventId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEYS.setting, eventId],
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!eventId) throw new Error('Event ID is required');
      return await eventsClient.updatePayment(eventId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_QUERY_KEYS.payment, eventId],
      });
    },
  });

  return {
    infoDraftMutation,
    showMutation,
    settingMutation,
    paymentMutation,
  };
};
