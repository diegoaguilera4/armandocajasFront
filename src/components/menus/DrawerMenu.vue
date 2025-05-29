<template>
  <v-app-bar collapse elevation="0" style="background-color: transparent;">
    <v-btn v-show="!drawer" style="background-color: #006398;" icon @click="toggleDrawer">
      <v-icon color="white">mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer :width="330" v-model="drawer" temporary style="top: 0; left: 0;  height: 100%;">

    <v-list>
      <v-img src="../../assets/csf.png" height="45px" style="margin-top: 30px; margin-bottom: 30px;"></v-img>
    </v-list>

    <v-list>
      <v-list-item prepend-icon="mdi-account-circle" :subtitle="correo" :title="nombre"></v-list-item>
    </v-list>

    <v-divider></v-divider>
    <v-list v-model:opened="open" density="compact" nav>

      <v-list-group v-if="filteredMantenedores.length > 0" value="Mantenedores" density="compact" nav>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-apps" title="Mantenedores"></v-list-item>
        </template>
        <v-list-item v-for="item in filteredMantenedores" :key="item.value" :prepend-icon="item.icon"
          :title="item.title" @click="$router.push(item.route)"></v-list-item>
      </v-list-group>
      <v-list-group v-if="filteredLogsKardex.length > 0" value="Logskardex" density="compact" nav>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-scale-balance" title="Movimientos y saldos"></v-list-item>
        </template>
        <v-list-item v-for="item in filteredLogsKardex" :key="item.value" :prepend-icon="item.icon" :title="item.title"
          @click="$router.push(item.route)"></v-list-item>
      </v-list-group>
      <v-list-group v-if="filteredArmado.length > 0" value="Armado" density="compact" nav>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-package-variant-closed" title="Armado"></v-list-item>
        </template>
        <v-list-item v-for="item in filteredArmado" :key="item.value" :prepend-icon="item.icon" :title="item.title"
          @click="$router.push(item.route)"></v-list-item>
      </v-list-group>
      <v-list-group v-if="filteredArmarCajas.length > 0" value="ArmarCajas" density="compact" nav>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-package-variant-closed-plus" title="Armar cajas"></v-list-item>
        </template>
        <v-list-item v-for="item in filteredArmarCajas" :key="item.value" :prepend-icon="item.icon" :title="item.title"
          @click="$router.push(item.route)"></v-list-item>
      </v-list-group>
      <v-list-group v-if="filteredRecibirCajas.length > 0" value="RecibirCajas" density="compact" nav>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-package-variant-closed-plus"
            title="Recibir cajas"></v-list-item>
        </template>
        <v-list-item v-for="item in filteredRecibirCajas" :key="item.value" :prepend-icon="item.icon"
          :title="item.title" @click="$router.push(item.route)"></v-list-item>
      </v-list-group>
      <v-list-item v-for="item in filteredMenuItems" :key="item.value" :prepend-icon="item.icon" :title="item.title"
        @click="$router.push(item.route)"></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" value="cerrarsesion" @click="logout"
        style="background-color: #E0E0E0;"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'DrawerMenu',
  data() {
    return {
      rolMomentaneo: [],
      drawer: false,
      nombre: '',
      correo: '',
      rol: '',
      mantenedores: [
        { title: 'Usuarios', icon: 'mdi-account-group', route: '/usuarios', roles: ['admin', 'revisor superior'] },
        { title: 'Prestadores de servicios', icon: 'mdi-package', route: '/prestadores', roles: ['admin', 'revisor superior', 'revisor csf', 'gestor de adhesivo'] },
        { title: 'Lugares de armado', icon: 'mdi-package-variant', route: '/lugaresArmado', roles: ['admin', 'revisor superior'] },
        { title: 'Temporadas', icon: 'mdi-calendar-clock', route: '/temporadas', roles: ['admin', 'revisor superior'] },
        { title: 'Zonas', icon: 'mdi-map', route: '/zonas', roles: ['admin', 'revisor superior'] },
        { title: 'Servicios', icon: 'mdi-hammer-screwdriver', route: '/servicios', roles: ['admin', 'revisor superior'] },
        { title: 'Adhesivos', icon: 'mdi-water', route: '/adhesivos', roles: ['admin'] },
        { title: 'Máquinas', icon: 'mdi-engine', route: '/maquinas', roles: ['admin', 'operador logistico'] },
        { title: 'Tipo de detenciones', icon: 'mdi-timer-off', route: '/tipoDetenciones', roles: ['admin', 'revisor superior'] },
        { title: 'Requis tarmado', icon: 'mdi-order-bool-ascending', route: '/requis', roles: ['admin', 'gestor de armado'] },
        { title: 'Lugares de armado', icon: 'mdi-package-variant', route: '/lugaresPrestador', roles: ['prestador'] },
        { title: 'Mis servicios', icon: 'mdi-hammer-screwdriver', route: '/misServicios', roles: ['prestador'] },
        { title: 'Mis folios', icon: 'mdi-ticket', route: '/misFolios', roles: ['prestador'] },

      ],
      logsKardex: [
        { title: 'Adhesivos prestador', icon: 'mdi-water', route: '/adhesivoPrestadorKardex', roles: ['admin', 'revisor superior', 'gestor de adhesivo'] },
        { title: 'Adhesivos lugar de armado', icon: 'mdi-water', route: '/adhesivoLugarKardex', roles: ['admin', 'revisor superior', 'gestor de adhesivo'] },
        { title: 'Traslados de máquinas', icon: 'mdi-truck-delivery', route: '/maquinasKardex', roles: ['admin', 'revisor superior', 'operador logistico'] },
        { title: 'Armado saldo', icon: 'mdi-package-variant-closed', route: '/armadoSaldo', roles: ['admin'] },
        { title: 'Armado kardex', icon: 'mdi-package-variant-closed', route: '/armadoKardex', roles: ['admin'] },
        { title: 'Requis saldo', icon: 'mdi-package-variant-closed', route: '/requisSaldo', roles: ['admin'] },
        { title: 'Logs', icon: 'mdi-server-security', route: '/logs', roles: ['admin', 'revisor superior'] },
      ],
      armado: [
        { title: 'Preliquidar', icon: 'mdi-form-select', route: '/preliquidar', roles: ['revisor superior','revisor csf'] },
        { title: 'Formularios', icon: 'mdi-form-select', route: '/formularios', roles: ['admin', 'revisor superior', 'revisor csf'] },
        { title: 'Liquidaciones', icon: 'mdi-cash-check', route: '/liquidaciones', roles: ['revisor superior', 'revisor csf', 'admin'] },
        { title: 'Formularios', icon: 'mdi-form-select', route: '/armadosPrestador', roles: ['prestador'] },
        { title: 'Liquidaciones', icon: 'mdi-cash-check', route: '/misLiquidaciones', roles: ['prestador'] },
      ],
      armarCajas: [
        { title: 'Armar anticipado', icon: 'mdi-package-variant-closed-plus', route: '/armarAnt', roles: ['digitador'] },
        { title: 'Armar NV', icon: 'mdi-package-variant-closed-plus', route: '/armarNv', roles: ['digitador'] },
        //{ title: 'Armar stock CSF', icon: 'mdi-package-variant-closed-plus', route: '/armarStockCsf', roles: ['digitador'] },
        { title: 'Armar externo', icon: 'mdi-package-variant-closed-plus', route: '/armarExterno', roles: ['digitador'] },
        { title: 'Crear formulario', icon: 'mdi-form-select', route: '/crearFormulario', roles: ['digitador'] }

      ],
      recibirCajas: [
        { title: 'Recibir csf anticipado', icon: 'mdi-package-variant-closed-plus', route: '/recibirCsfAnt', roles: ['operador logistico'] },
        { title: 'Recibir cliente anticipado', icon: 'mdi-package-variant-closed-plus', route: '/recibirClienteAnt', roles: ['operador logistico'] },
        { title: 'Recibir NV', icon: 'mdi-package-variant-closed-plus', route: '/recibirNv', roles: ['operador logistico'] },
        //{ title: 'Recibir stock CSF', icon: 'mdi-package-variant-closed-plus', route: '/recibirStockCsf', roles: ['operador logistico'] },
        { title: 'Recibir externo', icon: 'mdi-package-variant-closed-plus', route: '/recibirExterno', roles: ['operador logistico'] },
        { title: 'Ajuste positivo', icon: 'mdi-pen-plus', route: '/ajustarPositivo', roles: ['operador logistico'] },
        { title: 'Ajuste negativo', icon: 'mdi-pen-minus', route: '/ajustarNegativo', roles: ['operador logistico'] },

      ],
      menuItems: [],
      open: [''],
    };
  },
  computed: {
    filteredMantenedores() {
      return this.mantenedores.filter(item =>
        item.roles.includes(this.rol) || this.rolMomentaneo.some(rm => item.roles.includes(rm.rol))
      );
    },
    filteredMenuItems() {
      return this.menuItems.filter(item =>
        item.roles.includes(this.rol) || this.rolMomentaneo.some(rm => item.roles.includes(rm.rol))
      );
    },
    filteredLogsKardex() {
      return this.logsKardex.filter(item =>
        item.roles.includes(this.rol) || this.rolMomentaneo.some(rm => item.roles.includes(rm.rol))
      );
    },
    filteredArmado() {
      return this.armado.filter(item =>
        item.roles.includes(this.rol) || this.rolMomentaneo.some(rm => item.roles.includes(rm.rol))
      );
    },
    filteredArmarCajas() {
      return this.armarCajas.filter(item =>
        item.roles.includes(this.rol) || this.rolMomentaneo.some(rm => item.roles.includes(rm.rol))
      );
    },
    filteredRecibirCajas() {
      return this.recibirCajas.filter(item =>
        item.roles.includes(this.rol) || this.rolMomentaneo.some(rm => item.roles.includes(rm.rol))
      );
    },
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user'));
    this.rol = user ? user.rol : '';
    this.nombre = user ? user.nombre : '';
    this.correo = user ? user.correo : '';
    this.rolMomentaneo = user ? user.rolMomentaneo : [];
    //verificar que rolMomentaneo[0].fechaInicio < hoy < rolMomentaneo[0].fechaFin
    if (this.rolMomentaneo.length > 0) {
      const fechaInicio = new Date(this.rolMomentaneo[0].fechaInicio);
      const fechaFin = new Date(this.rolMomentaneo[0].fechaFin);
      const hoy = new Date();
      if (hoy < fechaInicio || hoy > fechaFin) {
        //eliminar rol momentaneo
        this.rolMomentaneo = [];
      }
    }
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    async logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$notify({
        text: 'Sesión cerrada',
        type: 'exito'
      });
      this.$router.push('/');
    }
  }
}
</script>