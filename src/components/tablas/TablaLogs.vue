<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-select v-model="filtroTabla" clearable chips prepend-inner-icon="mdi-magnify" label="Tabla"
                    :items="tablas" @update:model-value="cambioTabla"></v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-select v-model="filtroAccion" clearable chips prepend-inner-icon="mdi-magnify" label="Acción"
                :items="accionesFiltradas"></v-select>
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
    <v-data-table-server :mobile="smAndDown" v-model:items-per-page="itemsPerPage" :headers="headers"
        :items="serverItems" :items-length="totalItems" :loading="loading" :search="search" item-value="_id"
        @update:options="loadItems" items-per-page-text="Logs por página" page-text="{0}-{1} de {2}"
        loading-text="Cargando, por favor espere" :items-per-page-options="[10, 25, 50, totalItems]">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Logs<v-icon class="mx-2">mdi-server-security</v-icon></v-toolbar-title>
                <v-btn append-icon="mdi-file-excel" variant="elevated" color="green" style="margin-right: 20px;"
                    @click="exportarExcel()">Exportar</v-btn>
            </v-toolbar>
        </template>
        <template v-slot:[`item.accion`]="{ item }">
            <div v-if="item.accion === 'actualizar'">
                <v-chip color="#FB8C00" variant="flat"> <v-icon icon="mdi-pencil" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'crear'">
                <v-chip color="#1E88E5" variant="flat"> <v-icon icon="mdi-plus-circle" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'agregarMiembro'">
                <v-chip color="#1E88E5" variant="flat"> <v-icon icon="mdi-account-multiple-plus" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'quitarMiembro'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-account-multiple-minus" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'agregarDigitador'">
                <v-chip color="#00897B" variant="flat"> <v-icon icon="mdi-account-multiple-plus" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'aprobar'">
                <v-chip color="#43A047" variant="flat"> <v-icon icon="mdi-check-circle" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'liquidar'">
                <v-chip color="#43A047" variant="flat"> <v-icon icon="mdi-cash" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'preliquidar'">
                <v-chip color="primary" variant="flat"> <v-icon icon="mdi-cash-clock" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'formulario anulado'">
                <v-chip color="red" variant="flat"> <v-icon icon="mdi-file-cancel" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'eliminarFormulario'">
                <v-chip color="red" variant="flat"> <v-icon icon="mdi-cash-edit" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'cancelarLiquidacion'">
                <v-chip color="red" variant="flat"> <v-icon icon="mdi-cash-remove" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'actualizar servicios'">
                <v-chip color="#FB8C00" variant="flat"> <v-icon icon="mdi-pencil" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'eliminar'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-delete" start></v-icon> {{ item.accion
                }}</v-chip>
            </div>
            <div v-if="item.accion === 'agregarServicio'">
                <v-chip color="#1E88E5" variant="flat"> <v-icon icon="mdi-hammer-screwdriver" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'quitarServicio'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-hammer-screwdriver" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'actualizarServicio'">
                <v-chip color="#FB8C00" variant="flat"> <v-icon icon="mdi-hammer-screwdriver" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'agregarMaquina'">
                <v-chip color="#1E88E5" variant="flat"> <v-icon icon="mdi-engine" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'quitarMaquina'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-engine" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'agregarStockAdhesivo'">
                <v-chip color="#1E88E5" variant="flat"> <v-icon icon="mdi-water-plus" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'actualizarStockAdhesivo'">
                <v-chip color="#FB8C00" variant="flat"> <v-icon icon="mdi-water-outline" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'eliminarStockAdhesivo'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-water-remove" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'actualizarEstado'">
                <v-chip v-if="item.despues.includes('bloqueado')" color="#E53935" variant="flat"> <v-icon
                        icon="mdi-account-off" start></v-icon> {{
                            item.accion
                        }}</v-chip>
                <v-chip v-if="item.despues.includes('activo')" color="#558B2F" variant="flat"> <v-icon
                        icon="mdi-account-check" start></v-icon> {{
                            item.accion
                        }}</v-chip>
            </div>
            <div v-if="item.accion.startsWith('C_RECIB')">
                <v-chip color="#558B2F" variant="flat"> <v-icon icon="mdi-package-variant-closed-plus" start></v-icon>
                    {{
                        item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion.startsWith('actualizarContraseña')">
                <v-chip color="#FF6F00" variant="flat"> <v-icon icon="mdi-lock" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'agregarRolMomentaneo'">
                <v-chip color="#1E88E5" variant="flat"> <v-icon icon="mdi-badge-account" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'quitarRolMomentaneo'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-badge-account" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'anularFolio'">
                <v-chip color="#E53935" variant="flat"> <v-icon icon="mdi-file-cancel" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
            <div v-if="item.accion === 'cancelarAnulacion'">
                <v-chip color="#FB8C00" variant="flat"> <v-icon icon="mdi-file-cancel" start></v-icon> {{
                    item.accion
                    }}</v-chip>
            </div>
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
            { title: 'Acción', key: 'accion', align: 'start', sortable: false },
            { title: 'Tabla', key: 'tabla', align: 'start', sortable: false },
            { title: 'ID', key: 'idObjeto', align: 'start', sortable: false },
            { title: 'Usuario', key: 'usuarioCorreo', align: 'start', sortable: false },
            { title: 'Antes', key: 'antes', align: 'start', sortable: false },
            { title: 'Después', key: 'despues', align: 'start', sortable: false },
            { title: 'Fecha', key: 'fechaAux', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        filtroAccion: null,
        filtroTabla: null,
        tablas: [],
        acciones: [],
        accionesPorTabla: [],
        search: '',
        editedItem: {
        },
        defaultItem: {
        },
        smAndDown: window.innerWidth < 960,
        rangoFecha: ref([]),
    }),
    computed: {
        accionesFiltradas() {
            return this.filtroTabla ? this.accionesPorTabla[this.filtroTabla] || [] : [];
        }
    },
    watch: {
        filtroAccion() {
            this.search = String(Date.now());
        },
        filtroTabla() {
            this.search = String(Date.now());
        },
        smAndDown(newValue) {
            return newValue;
        },
        rangoFecha() {
            this.search = String(Date.now());
        }
    },
    methods: {
        cambioTabla(){
            //actualizar acciones a la tabla seleccionada 
            this.filtroAccion = null;
        },
        async exportarExcel() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/logs/exportar/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            accion: this.filtroAccion,
                            tabla: this.filtroTabla,
                            fecha: this.rangoFecha,
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'logs.xlsx');
                        document.body.appendChild(link);
                        link.click();
                    }
                    ).catch((error) => {
                        console.error('Error al exportar a excel', error);
                    });
            } catch (error) {
                console.error('Error al exportar a excel', error);
            }
        },
        reniciarFecha() {
            this.rangoFecha = [];
        },
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/logs`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        accion: this.filtroAccion,
                        tabla: this.filtroTabla,
                        fecha: this.rangoFecha,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.logs;
                    this.totalItems = response.data.total;
                    this.tablas = response.data.tablas;
                    this.accionesPorTabla = response.data.accionesPorTabla;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },

        //

    },
};
</script>

<style></style>