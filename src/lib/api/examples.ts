/**
 * API Usage Examples
 * This file contains examples of how to use the API client with various HTTP methods
 * 
 * IMPORTANT: This file is for demonstration purposes only.
 * It is not meant to be imported or used directly in the application.
 */

import apiClient from '../api-client';
import { api } from './index';
import { ApiResponse } from './api-utils';
import { DepartmentInfo } from '@/lib/types';

/**
 * Example: Using the api object (recommended approach)
 */
export async function apiExamples() {
    // GET request - Fetch departments
    const departments = await api.departments.getAllDepartments();
    console.log('Departments:', departments);

    // POST request - Create a department
    const newDepartment = await api.departments.createDepartment({
        name: 'New Department',
        description: 'This is a new department',
        parentId: null
    });
    console.log('Created department:', newDepartment);

    // PUT request - Update a department
    const updatedDepartment = await api.departments.updateDepartment(newDepartment.id, {
        name: 'Updated Department Name'
    });
    console.log('Updated department:', updatedDepartment);

    // DELETE request - Delete a department
    await api.departments.deleteDepartment(newDepartment.id);
    console.log('Department deleted');

    // Using the department tree API
    const departmentTree = await api.departments.getDepartmentsTree();
    console.log('Department tree:', departmentTree);
}

/**
 * Example: Using the apiClient directly
 * This is useful for custom endpoints or one-off requests
 */
export async function apiClientExamples() {
    // GET request with query parameters
    const response1 = await apiClient.get<ApiResponse<DepartmentInfo[]>>('/departments', {
        params: {
            parentId: null,
            sortBy: 'name',
            sortOrder: 'asc'
        }
    });
    console.log('GET response:', response1.data.data);

    // POST request with data
    const response2 = await apiClient.post<ApiResponse<DepartmentInfo>>('/departments', {
        name: 'New Department',
        description: 'Created via direct API client call',
    });
    console.log('POST response:', response2.data.data);

    // PUT request for full update
    const departmentId = response2.data.data.id;
    const response3 = await apiClient.put<ApiResponse<DepartmentInfo>>(`/departments/${departmentId}`, {
        name: 'Updated Name',
        description: 'Updated via PUT'
    });
    console.log('PUT response:', response3.data.data);

    // PATCH request for partial update
    const response4 = await apiClient.patch<ApiResponse<DepartmentInfo>>(`/departments/${departmentId}`, {
        description: 'Partially updated via PATCH'
    });
    console.log('PATCH response:', response4.data.data);

    // OPTIONS request to check available methods
    const response5 = await apiClient.options<ApiResponse<{ methods: string[] }>>('/departments');
    console.log('Available methods:', response5.data.data.methods);

    // DELETE request
    const response6 = await apiClient.delete<ApiResponse<void>>(`/departments/${departmentId}`);
    console.log('DELETE response status:', response6.status);
}

/**
 * Example: Error handling
 */
export async function errorHandlingExample() {
    try {
        // Attempt to get a department that doesn't exist
        const response = await apiClient.get<ApiResponse<DepartmentInfo>>('/departments/non-existent-id');
        console.log('Department:', response.data.data);
    } catch (error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
    }
} 