<template>
  <div style="padding: 20px;">
    <h1 style="color: #000; font-size: 32px; margin-bottom: 10px;">Dashboard</h1>
    <p style="color: #666; margin-bottom: 20px;">
      Welcome back, {{ authStore.profile?.displayName || authStore.profile?.email || 'User' }}!
    </p>

    <!-- KPI Cards - Plain HTML with inline styles -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Tickets Sold Today</div>
        <div style="font-size: 24px; font-weight: bold;">0</div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Revenue (UGX)</div>
        <div style="font-size: 24px; font-weight: bold;">0</div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Active Trips</div>
        <div style="font-size: 24px; font-weight: bold;">0</div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Vehicles Online</div>
        <div style="font-size: 24px; font-weight: bold;">0</div>
      </div>
    </div>

    <!-- Charts placeholder -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Sales Over Time</h3>
        <div style="height: 256px; display: flex; align-items: center; justify-content: center; color: #9ca3af; border: 1px dashed #d1d5db; border-radius: 4px;">
          Chart will be implemented here
        </div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Top Routes</h3>
        <div style="height: 256px; display: flex; align-items: center; justify-content: center; color: #9ca3af; border: 1px dashed #d1d5db; border-radius: 4px;">
          Chart will be implemented here
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
</script>

