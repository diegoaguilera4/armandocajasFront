<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="6" md="3" sm="5">
                <v-text-field v-model="rutCliente" prepend-inner-icon="mdi-magnify" label="RUT Cliente"
                    hide-details clearable></v-text-field>
            </v-col>
            <v-col cols="6" md="3" sm="5">
                <v-text-field v-model="nombreCliente" prepend-inner-icon="mdi-magnify" label="Nombre Cliente"
                    hide-details clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-divider></v-divider>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems" :items-per-page-options="[10,25,50,totalItems]"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        items-per-page-text="Registros por página" page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">

        <template v-slot:[`item.FEC_EMI_NV`]="{ item }">
            <span>{{ formatearFecha(item.FEC_EMI_NV) }}</span>
        </template>

        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Recibir cajas" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="recibirCajas(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
    </v-data-table-server>

    <v-dialog v-model="loadingBuscar" hide-overlay persistent width="300">
        <v-card class="d-flex flex-column align-center justify-center" style="padding: 20px; border-radius: 25px;">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <v-card-title class="text-center" style="margin-top: 20px;">Cargando...</v-card-title>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            itemsPerPage: 10,
            headers: [
                { title: 'Acciones', key: 'actions', sortable: false },
                { title: 'Cantidad solicitada', key: 'CAN_SOL_NV', align: 'start', sortable: false },
                { title: 'Cantidad despachada', key: 'CAN_DESPAC', align: 'start', sortable: false },
                { title: 'Cantidad armada', key: 'CAN_ARMADA_XDESPACHAR', align: 'start', sortable: false },
                { title: 'Guía', key: 'DOCUMENTO', align: 'start', sortable: false },
                { title: 'NV', key: 'NV', align: 'start', sortable: false },
                { title: 'Código', key: 'COD_CSF', align: 'start', sortable: false },
                { title: 'Tipo armado', key: 'TARMADO', align: 'start', sortable: false },
                { title: 'RUT Cliente', key: 'RUT', align: 'start', sortable: false },
                { title: 'Nombre Cliente', key: 'NOMBREI', align: 'start', sortable: false },
                { title: 'Código Cliente', key: 'COD_CLI', align: 'start', sortable: false },
                { title: 'Descripción', key: 'DESCRI', align: 'start', sortable: false },
                { title: 'Fecha emitida', key: 'FEC_EMI_NV', align: 'start', sortable: false },
                { title: 'Fecha despacho', key: 'FEC_DESPAC', align: 'start', sortable: false },

            ],
            serverItems: [],
            loading: true,
            totalItems: 0,
            loadingBuscar: false,
            search: '',
            rutCliente: '',
            nombreCliente: '',

        };
    },
    watch: {
        rutCliente() {
            this.search = String(Date.now());
        },
        nombreCliente() {
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
                await axios.get(`/database/obtenerHR`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        rut: this.rutCliente,
                        nombre: this.nombreCliente,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.serverItems = response.data.tabla;
                    this.totalItems = response.data.total;
                }).catch(error => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },
        recibirCajas(item) {
            console.log('Recibir cajas', item);
        },
        formatearFecha(fecha) {
            const date = new Date(fecha);
            date.setDate(date.getDate() + 1);
            return date.toLocaleDateString('es-CL');
        },
    },
};
</script>
