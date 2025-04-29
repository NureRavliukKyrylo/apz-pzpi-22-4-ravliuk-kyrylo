import { apiClient } from "shared/api/apiClient";
import {
  Container,
  StatusContainer,
  TypeContainer,
} from "entities/container/containerTypes";
import { PaginatedContainersResponse } from "../model/useContainersQuery";
import { PaginatedContainerStatusResponse } from "../model/useContainerStatusesQuery";
import { PaginatedContainerTypeResponse } from "../model/useContainerTypesQuery";

export const containerApi = {
  getAllContainers: async (): Promise<Container[]> => {
    const response = await apiClient.get<Container[]>("/containers/");
    return response.data;
  },

  addContainer: async (data: {
    station_id: number;
    type_of_container_id: number;
    status_container_id: number;
  }): Promise<void> => {
    await apiClient.post("/containers/", data);
  },

  deleteContainer: async (containerId: number): Promise<void> => {
    await apiClient.delete(`/containers/${containerId}/`);
  },

  updateContainerType: async (
    containerId: number,
    type_of_container_id: number
  ): Promise<void> => {
    await apiClient.patch(`/containers/${containerId}/update-type/`, {
      type_of_container_id,
    });
  },

  getAllContainerStatuses: async (): Promise<StatusContainer[]> => {
    const response = await apiClient.get<StatusContainer[]>(
      "/statusOfContainers/"
    );
    return response.data;
  },

  getContainerStatusById: async (id: number): Promise<StatusContainer> => {
    const response = await apiClient.get<StatusContainer>(
      `/statusOfContainers/${id}/`
    );
    return response.data;
  },

  getContainerById: async (id: number): Promise<Container> => {
    const response = await apiClient.get<Container>(`/containers/${id}/`);
    return response.data;
  },

  addContainerStatus: async (status_name: string): Promise<void> => {
    await apiClient.post("/statusOfContainers/", {
      status_name,
    });
  },

  deleteContainerStatus: async (statusId: number): Promise<void> => {
    await apiClient.delete(`/statusOfContainers/${statusId}/`);
  },

  getAllContainerTypes: async (): Promise<TypeContainer[]> => {
    const response = await apiClient.get<TypeContainer[]>("/typeOfContainers/");
    return response.data;
  },

  addContainerType: async (data: {
    type_name_container: string;
    volume_container: number;
  }): Promise<void> => {
    await apiClient.post("/typeOfContainers/", data);
  },

  getContainerTypeById: async (id: number): Promise<TypeContainer> => {
    const response = await apiClient.get<TypeContainer>(
      `/typeOfContainers/${id}/`
    );
    return response.data;
  },

  deleteContainerType: async (typeId: number): Promise<void> => {
    await apiClient.delete(`/typeOfContainers/${typeId}/`);
  },

  updateContainerStatusName: async (
    statusId: number,
    statusName: string
  ): Promise<void> => {
    await apiClient.put(`/statusOfContainers/${statusId}/`, {
      status_name: statusName,
    });
  },
  updateTypeContainerData: async (
    typeId: number,
    typeName: string,
    typeVolume: number
  ): Promise<void> => {
    await apiClient.put(`/typeOfContainers/${typeId}/`, {
      type_name_container: typeName,
      volume_container: typeVolume,
    });
  },

  getContainersWithParams: async (
    params: string
  ): Promise<PaginatedContainersResponse> => {
    const response = await apiClient.get(`/containers/?${params}`);
    return response.data;
  },

  getContainerStatusesWithParams: async (
    params: string
  ): Promise<PaginatedContainerStatusResponse> => {
    const response = await apiClient.get(`/statusOfContainers/?${params}`);
    return response.data;
  },
  getContainerTypesWithParams: async (
    params: string
  ): Promise<PaginatedContainerTypeResponse> => {
    const response = await apiClient.get(`/typeOfContainers/?${params}`);
    return response.data;
  },
};
