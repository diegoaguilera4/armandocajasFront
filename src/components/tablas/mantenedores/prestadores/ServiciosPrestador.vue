<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" md="3" sm="5">
                <v-text-field v-model="filtro" label="Buscar por lugar" clearable/>
            </v-col>
        </v-row>
    </v-container>

    <v-toolbar flat style="background-color: #006398; color: white;">
        <v-toolbar-title>Servicios por lugar de armado<v-icon
                class="mx-2">mdi-hammer-screwdriver</v-icon></v-toolbar-title>
    </v-toolbar>
    <!-- Lista de lugares filtrados -->
    <v-expansion-panels v-model="panelActivo">
        <v-expansion-panel v-for="(lugar, index) in lugaresFiltrados" :key="index"
            :class="{ 'primary-panel': panelActivo === index }">
            <v-expansion-panel-title>
                {{ lugar.lugar }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <div style=" overflow-y: auto;">
                    <v-card style="border-radius: 20px;">
                        <v-table>
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Rango 1</th>
                                    <th>Rango 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(servicio, idx) in lugar.servicios" :key="idx">
                                    <td>{{ servicio.servicio }}</td>
                                    <td>${{ servicio.rango1 }} CLP</td>
                                    <td>${{ servicio.rango2 }} CLP</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>

                </div>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>

    <!-- Mensaje si no hay resultados -->
    <v-alert v-if="lugaresFiltrados.length === 0" type="info" border="start" class="mt-4" color="secondary">
        No se encontraron lugares que coincidan con el criterio de búsqueda.
    </v-alert>
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        filtro: "", // Campo de texto para la búsqueda
        lugares: [], // Aquí se guardará el response.data
        panelActivo: null, // Índice del panel abierto
    }),
    computed: {
        // Filtrar lugares según el texto de búsqueda
        lugaresFiltrados() {
            const filtroEnMinuscula = (this.filtro || "").toLowerCase().trim();
            if (!filtroEnMinuscula) return this.lugares;

            return this.lugares.filter((lugar) =>
                lugar.lugar.toLowerCase().includes(filtroEnMinuscula)
            );
        },
    },
    watch: {
    },
    async created() {
        await this.obtenerServicios();
    },
    methods: {
        async obtenerServicios() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const user = JSON.parse(localStorage.getItem('user'));
                const prestadorId = user.prestador[0].prestadorId;
                const response = await axios.get(`/prestadores/obtenerServicios/${prestadorId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.lugares = response.data;
            } catch (error) {
                console.error('Error al obtener los servicios del prestador', error);
                this.$notify({
                    text: 'Error al obtener los servicios del prestador',
                    type: 'fallo'
                });
            }
        }
    },
};
</script>

<style scoped>
.primary-panel {
    background-color: #006398 !important;
    /* Vuetify primary color */
    color: white !important;
}
</style>