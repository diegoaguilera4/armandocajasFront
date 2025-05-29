<template>
  
    <v-container fluid style="background-color: #006398;">
      <v-row class="d-flex justify-space-around" >
        <v-col>
          <v-btn prepend-icon="mdi-truck-fast" id="menu-1" color="primary" block >
            Recibir cajas
          </v-btn>
          <v-menu activator="#menu-1" >
            <v-list style="background-color: #006398;">
              <v-list-item v-for="(item, index) in recibirCajas" :key="index" :to="item.url">
                <v-list-item-title style="color: white;">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
  
        <v-col>
          <v-btn prepend-icon="mdi-plus-minus-variant" id="menu-2" color="primary" block>
            Ajustar cajas
          </v-btn>
          <v-menu activator="#menu-2">
            <v-list style="background-color: #006398;">
              <v-list-item v-for="(item, index) in ajustesCajas" :key="index" :to="item.url">
                <v-list-item-title style="color: white;">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
  
        <v-col>
          <v-btn prepend-icon="mdi-package-variant-closed-plus" id="menu-3" color="primary" block>
            Armar cajas
          </v-btn>
          <v-menu activator="#menu-3">
            <v-list style="background-color: #006398;">
              <v-list-item v-for="(item, index) in armarCajas" :key="index" :to="item.url">
                <v-list-item-title style="color: white;">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data: () => ({
      recibirCajas: [
        { title: 'Recibir csf anticipado', url: '/recibirCsfAnt' },
        { title: 'Recibir cliente anticipado', url: '/recibirClienteAnt' },
        { title: 'Recibir nv', url: '/recibirNv' },
        { title: 'Recibir stock CSF', url: '/recibirStockCsf' },
        { title: 'Recibir externo', url: '/recibirExterno' },

      ],
      armarCajas: [
        { title: 'Armar anticipado', url: '/armarAnt' },
        { title: 'Armar nv', url: '/armarNv' },
        { title: 'Armar stock CSF', url: '/armarStockCsf' },
        { title: 'Armar externo', url: '/armarExterno' },
      ],
      ajustesCajas: [
        { title: 'Ajustar positivo', url: '/ajustarPositivo' },
        { title: 'Ajustar negativo', url: '/ajustarNegativo' },
      ],
    }),
  }
  </script>
  
  <style scoped>
  /* Media queries for responsive design */
  @media (max-width: 600px) {
    .v-btn {
      font-size: 14px;
    }
  }
  </style>