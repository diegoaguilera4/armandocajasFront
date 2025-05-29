<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroNombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">

                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroMarca" label="Marca" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroGuia" label="Guía de despacho"
                    hide-details clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Traslados por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Traslados de máquinas<v-icon class="mx-2">mdi-truck-delivery</v-icon></v-toolbar-title>
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
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'N° máquina', key: 'nmaquina', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Marca', key: 'marca', align: 'start', sortable: false },
            { title: 'Modelo', key: 'modelo', align: 'start', sortable: false },
            { title: 'Guía de despacho', key: 'guiaDespacho', align: 'start', sortable: false },
            { title: 'Desde', key: 'desde', align: 'start', sortable: false },
            { title: 'Hacia', key: 'hacia', align: 'start', sortable: false },
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
        filtroNombre: '',
        filtroMarca: '',
        filtroGuia: '',
    }),
    watch: {
        filtroNombre() {
            this.search = String(Date.now());
        },
        filtroMarca() {
            this.search = String(Date.now());
        },
        filtroGuia() {
            this.search = String(Date.now());
        },
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquina/kardex`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.filtroNombre,
                        marca: this.filtroMarca,
                        guiaDespacho: this.filtroGuia
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.maquinasKardex;
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
    }
};
</script>

<style></style>