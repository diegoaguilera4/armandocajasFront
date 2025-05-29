<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Prestador" chips clearable
                    :items="prestadores" item-title="nombreCorto" item-value="id" @change="onPrestadorChange">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3" v-if="lugares.length > 0">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroLugar" label="Lugar de armado" chips clearable
                    :items="lugares" item-title="nombre" item-value="id">
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroAdhesivo" label="Adhesivo" chips clearable
                    :items="adhesivos" item-title="codigo" item-value="id">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.descripcion"></v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroOperacion" label="Operación" chips clearable
                    :items="operaciones">
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroGuia" label="Guía de despacho"
                    hide-details clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-locale-provider locale="es">
                    <v-date-input v-model="rangoFecha" label="Fecha" prepend-icon="" append-inner-icon="$calendar"
                        cancel-text="cancelar" multiple="range" ok-text="seleccionar" clearable
                        @click:clear="reniciarFecha()"></v-date-input>
                </v-locale-provider>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Operaciones por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Adhesivo por lugar de armado<v-icon class="mx-2">mdi-water</v-icon></v-toolbar-title>
            </v-toolbar>
        </template>
        <template v-slot:[`item.fecha`]="{ item }">
            <span>{{ formatearFecha(item.fecha) }}</span>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Adhesivo ID', key: 'adhesivoId', align: 'start', sortable: false },
            { title: 'Adhesivo código', key: 'adhesivoCodigo', align: 'start', sortable: false },
            { title: 'Lugar armado ID', key: 'lugarArmadoId', align: 'start', sortable: false },
            { title: 'Lugar armado', key: 'lugarArmadoNombre', align: 'start', sortable: false },
            { title: 'Operación', key: 'operacion', align: 'start', sortable: false },
            { title: 'Guía de despacho', key: 'guiaDespacho', align: 'start', sortable: false },
            { title: 'Kilos asignados', key: 'kilosAsignados', align: 'start', sortable: false },
            { title: 'Kilos disponibles', key: 'kilosDisponibles', align: 'start', sortable: false },
            { title: 'Kilos usados', key: 'kilosUsados', align: 'start', sortable: false },
            { title: 'Kilos operación', key: 'kilosEntrega', align: 'start', sortable: false },
            { title: 'Usuario ID', key: 'usuarioId', align: 'start', sortable: false },
            { title: 'Usuario correo', key: 'usuarioCorreo', align: 'start', sortable: false },
            { title: 'Fecha', key: 'fecha', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        search: '',
        editedItem: {
        },
        defaultItem: {
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        prestadores: [],
        filtroPrestador: null,
        filtroLugar: null,
        lugares: [],
        adhesivos: [],
        filtroAdhesivo: null,
        operaciones: ['Agregar', 'Añadir', 'Quitar', 'Consumo'],
        filtroOperacion: null,
        rangoFecha: ref([]),
        filtroGuia: null
    }),
    watch: {
        filtroPrestador() {
            this.onPrestadorChange(this.filtroPrestador);
        },
        filtroLugar() {
            this.search = String(Date.now());
        },
        filtroAdhesivo() {
            this.search = String(Date.now());
        },
        filtroOperacion() {
            this.search = String(Date.now());
        },
        rangoFecha() {
            this.search = String(Date.now());
        },
        filtroGuia() {
            this.search = String(Date.now());
        }
    },
    created() {
        this.obtenerPrestadores();
        this.obtenerAdhesivos();
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivokardex/lugarArmado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        lugarArmadoId: this.filtroLugar,
                        adhesivoId: this.filtroAdhesivo,
                        operacion: this.filtroOperacion,
                        fecha: this.rangoFecha,
                        guiaDespacho: this.filtroGuia
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.adhesivosLugarArmadoKardex;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },
        formatearFecha(fecha) {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        },
        async obtenerPrestadores() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/prestadores`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.prestadores = response.data;
                }).catch((error) => {
                    console.error('Error al cargar los prestadores', error);
                });
            } catch (error) {
                console.error(error);
            }
        },
        async obtenerAdhesivos() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivos`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.adhesivos = response.data;
                }).catch((error) => {
                    console.error('Error al cargar los prestadores', error);
                });
            } catch (error) {
                console.error(error);
            }
        },
        reniciarFecha() {
            this.rangoFecha = [];
        },
        onPrestadorChange(prestadorId) {
            // Cargar los lugares del prestador seleccionado
            const prestadorSeleccionado = this.prestadores.find(p => p.id === prestadorId);
            if (prestadorSeleccionado) {
                this.lugares = prestadorSeleccionado.lugares; // Asumiendo que cada prestador tiene una propiedad 'lugares'
            } else {
                this.lugares = [];
            }
            this.filtroLugar = null; // Resetear el filtro de lugar
        },
    }
};
</script>

<style></style>