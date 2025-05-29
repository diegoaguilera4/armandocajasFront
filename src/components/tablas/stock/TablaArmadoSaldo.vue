<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Prestador" chips clearable
                    :items="prestadores" item-title="nombreCorto" item-value="id" @change="onPrestadorChange">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroLugar" label="Lugar de armado" chips clearable
                    :items="lugares" item-title="nombre" item-value="id">
                </v-select>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="rutCliente" prepend-inner-icon="mdi-magnify" label="RUT Cliente" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="nombreCliente" prepend-inner-icon="mdi-magnify" label="Nombre Cliente"
                    hide-details clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="numreq" prepend-inner-icon="mdi-magnify" label="NV" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="6" lg="2" md="3" sm="4">
                <v-text-field v-model="codite" prepend-inner-icon="mdi-magnify" label="Código" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Armado saldo por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Armado saldo<v-icon class="mx-2">mdi-package-variant-closed</v-icon></v-toolbar-title>
            </v-toolbar>
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
            { title: 'NV', key: 'NUMREQ', align: 'start', sortable: false },
            { title: 'Código', key: 'CODITE', align: 'start', sortable: false },
            { title: 'Guía CSF', key: 'GUIA_CSF', align: 'start', sortable: false },
            { title: 'Cliente', key: 'IDECLI', align: 'start', sortable: false },
            { title: 'Tipo', key: 'TIPO', align: 'start', sortable: false },
            { title: 'RUT Cliente', key: 'RUTCLI', align: 'start', sortable: false },
            { title: 'Lugar de armado', key: 'LUGARDEARMADO', align: 'start', sortable: false },
            { title: 'Ciudad', key: 'CIUDADES', align: 'start', sortable: false },
            { title: 'Región', key: 'REGION', align: 'start', sortable: false },
            { title: 'Zona', key: 'ZONA', align: 'start', sortable: false },
            { title: 'Por armar', key: 'CAN_X_ARMAR', align: 'start', sortable: false },
            { title: 'Por despachar', key: 'CAN_ARMADA_XDESPACHAR', align: 'start', sortable: false },
            { title: 'Desperdicio', key: 'CAN_ARMADA_DESPERDICIO', align: 'start', sortable: false },
            { title: 'Recibido', key: 'CAN_RECIB', align: 'start', sortable: false },
            { title: 'Solicitado', key: 'CANSOL', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        search: '',
        rutCliente: '',
        nombreCliente: '',
        numreq: '',
        codite: '',
        prestadores: [],
        lugares: [],
        filtroPrestador: null,
        filtroLugar: null,
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

    }),
    watch: {
        rutCliente() {
            this.search = String(Date.now());
        },
        nombreCliente() {
            this.search = String(Date.now());
        },
        numreq() {
            this.search = String(Date.now());
        },
        codite() {
            this.search = String(Date.now());
        },
        dialogRecibir(val) {
            val || this.close();
        },
        filtroPrestador() {
            this.search = String(Date.now());
            this.onPrestadorChange(this.filtroPrestador);
        },
        filtroLugar() {
            this.search = String(Date.now());
        },
    },
    async created() {
        await this.obtenerPrestadores();
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/armadosaldo/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        rut: this.rutCliente,
                        prestadorId: this.filtroPrestador,
                        nombre: this.nombreCliente,
                        idLugar: this.filtroLugar,
                        numreq: this.numreq,
                        codite: this.codite,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.armadoSaldos;
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
                }).then(response => {
                    this.prestadores = response.data;
                }).catch(error => {
                    console.error('Error al obtener prestadores', error);
                });
            } catch (error) {
                console.error('Error al obtener prestadores', error);
            }
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