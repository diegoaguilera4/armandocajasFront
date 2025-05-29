<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="6" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nv" label="NV" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="codigo" label="Código" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="rutCliente" label="RUT cliente" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombreCliente" label="Nombre cliente"
                    hide-details clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Items por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Requis saldo<v-icon class="mx-2">mdi-package-variant-closed</v-icon></v-toolbar-title>
            </v-toolbar>
        </template>
        <template v-slot:[`item.FECEMI`]="{ item }">
            <span>{{ formatearFecha(item.FECEMI) }}</span>
        </template>
        <template v-slot:[`item.FECCUM`]="{ item }">
            <span>{{ formatearFecha(item.FECCUM) }}</span>
        </template>
        <template v-slot:[`item.RUTCLI`]="{ item }">
            <span>{{ formatearRut(item.RUTCLI) }}</span>
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
            { title: 'NV', key: 'NUMREQ', align: 'start', sortable: false },
            { title: 'Código', key: 'CODITE', align: 'start', sortable: false },
            { title: 'TIPO', key: 'TIPO', align: 'start', sortable: false },
            { title: 'RUT Cliente', key: 'RUTCLI', align: 'start', sortable: false },
            { title: 'Nombre cliente', key: 'IDECLI', align: 'start', sortable: false },
            { title: 'Fecha emitida', key: 'FECEMI', align: 'start', sortable: false },
            { title: 'Fecha de cumplimiento', key: 'FECCUM', align: 'start', sortable: false },
            { title: 'Cantidad solicitada', key: 'CANSOL', align: 'start', sortable: false },
            { title: 'Cantidad entregada', key: 'CANENT', align: 'start', sortable: false },
            { title: 'Por armar', key: 'TOTAL_CAN_X_ARMAR', align: 'start', sortable: false },
            { title: 'Por despachar', key: 'TOTAL_CAN_ARMADA_XDESPACHAR', align: 'start', sortable: false },
            { title: 'Desperdicio', key: 'TOTAL_CAN_ARMADA_DESPERDICIO', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
        },
        defaultItem: {
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        nombreCliente: '',
        rutCliente: '',
        nv: '',
        codigo: '',
    }),
    computed: {
    },
    watch: {
        nombreCliente() {
            this.search = String(Date.now());
        },
        rutCliente() {
            this.search = String(Date.now());
        },
        nv() {
            this.search = String(Date.now());
        },
        codigo() {
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
                await axios.get(`/database/obtenerRequisSaldo`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombreCliente: this.nombreCliente,
                        rutCliente: this.rutCliente,
                        numreq: this.nv,
                        codite: this.codigo
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.tabla;
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
                hour12: false
            });
        },
        formatearRut(rut) {
            //agregar - antes del ultimo numero
            return (rut.slice(0, -1) + '-' + rut.slice(-1)).replace(/^0+/, '');
        },
    }
};
</script>

<style></style>