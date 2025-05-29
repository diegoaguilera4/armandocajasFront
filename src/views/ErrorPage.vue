<template>
    <v-empty-state
      headline="Vaya, 404"
      title="Página no encontrada"
      text="La página que estabas buscando no existe"
      image="https://vuetifyjs.b-cdn.net/docs/images/logos/v.png"
    >
      <v-btn color="primary" to="/">Ir a inicio o login</v-btn>
    </v-empty-state>
  </template>
  
  <script>
  export default {
    name: "ErrorPage",
  };
  </script>