import { supabase } from '@/integrations/supabase/client';

export async function createAdminUser() {
  try {
    // Gabriel Gandin tenant ID
    const tenantId = '2429b7ea-da52-4fbb-8bbe-c678facfd260';
    
    const response = await supabase.functions.invoke('create-admin-user', {
      body: {
        email: 'jefersoncemep@gmail.com',
        password: 'admin123',
        fullName: 'Jeferson ADMIN',
        tenantId: tenantId
      }
    });

    if (response.error) {
      console.error('Error creating admin user:', response.error);
      throw response.error;
    }

    console.log('Admin user created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    throw error;
  }
}