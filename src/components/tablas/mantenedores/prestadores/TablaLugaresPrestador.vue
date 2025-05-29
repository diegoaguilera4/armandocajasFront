<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" md="3" sm="5">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombre" label="Buscar por nombre" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>

    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Lugares por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Lugares de armado<v-icon class="mx-2">mdi-package-variant</v-icon></v-toolbar-title>
            </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#26A69A" @click="irAdhesivos(item)">
                        mdi-water
                    </v-icon>
                </template>
            </v-tooltip>
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
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Ciudad', key: 'ciudad', align: 'start', sortable: false },
            { title: 'Region', key: 'region', align: 'start', sortable: false },
            { title: 'Zona', key: 'zona.nombre', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            nombre: '',
            prestadorId: null,
            zonaId: null,
            ciudad: null,
        },
        defaultItem: {
            nombre: '',
            prestadorId: null,
            zonaId: null,
            ciudad: null

        },
        editedIndex: -1,
        zonas: [],
        prestadores: [],
        zonasFiltradas: [],
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        ciudadesFiltradas: [],
    }),
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
        dialog(val) {
            if (!val) {
                this.close();
            }
        },
        dialogDelete(val) {
            if (!val) {
                this.closeDelete();
            }
        },
    },
    created() {
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const user = JSON.parse(localStorage.getItem('user'));
                await axios.get(`/lugarArmados/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombre,
                        prestadorId: user.prestador[0].prestadorId
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.lugarArmados;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar lugares', error);
                });
            } catch (error) {
                console.error('Error al cargar lugares', error);
            } finally {
                this.loading = false;
            }
        },
        irAdhesivos(item) {
            this.$router.push(`/adhesivosLugar/${item.id}/${item.nombre}`);

        },
    }
};
</script>

<style></style>