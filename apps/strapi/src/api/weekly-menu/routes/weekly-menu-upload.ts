export default {
  routes: [
    {
      method: 'POST',
      path: '/weekly-menu/customer-upload',
      handler: 'weekly-menu.customerUpload',
      config: {
        auth: false,
      },
    },
  ],
};
