<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="3" md="4" sm="4">
                <v-locale-provider locale="es">
                    <v-date-input v-model="rangoFechaPre" label="Fecha de pre-liquidación" prepend-icon=""
                        append-inner-icon="$calendar" cancel-text="cancelar" multiple="range" ok-text="seleccionar"
                        clearable @click:clear="reniciarFechaPre()"></v-date-input>
                </v-locale-provider>
            </v-col>
            <v-col cols="12" lg="3" md="4" sm="4">
                <v-locale-provider locale="es">
                    <v-date-input v-model="rangoFechaLiq" label="Fecha de liquidación" prepend-icon=""
                        append-inner-icon="$calendar" cancel-text="cancelar" multiple="range" ok-text="seleccionar"
                        clearable @click:clear="reniciarFechaLiq()"></v-date-input>
                </v-locale-provider>
            </v-col>
            <v-col cols="12" lg="3" md="4" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroEstado" label="Filtrar por estado"
                    :items="['Pre-liquidado', 'Liquidado']" clearable chips></v-select>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        :items-per-page-options="[10, 25, 50, totalItems]" items-per-page-text="Liquidaciones por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Liquidaciones<v-icon class="mx-2">mdi-cash-check</v-icon></v-toolbar-title>
            </v-toolbar>
        </template>
        <template v-slot:[`item.totalCajas`]="{ item }">
            <span>{{ formatearNumero(item.totalCajas) }}</span>
        </template>
        <template v-slot:[`item.totalPago`]="{ item }">
            <span>${{ formatearNumero(item.totalPago) }}</span>
        </template>
        <template v-slot:[`item.totalFinal`]="{ item }">
            <span>${{ formatearNumero(item.totalFinal) }}</span>
        </template>
        <template v-slot:[`item.fechaPreliquidado`]="{ item }">
            <span>{{ formatearFecha(item.fechaPreliquidado) }}</span>
        </template>
        <template v-slot:[`item.fechaLiquidado`]="{ item }">
            <span v-if="item.fechaLiquidado">{{ formatearFecha(item.fechaLiquidado) }}</span>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
            <div>
                <v-chip color="#42A5F5" v-if="item.estado === 'pre-liquidado'" variant="flat"> <v-icon
                        icon="mdi-cash-clock" start></v-icon> Pre-liquidado</v-chip>
                <v-chip color="green" v-if="item.estado === 'liquidado'" variant="flat"> <v-icon icon="mdi-cash-check"
                        start></v-icon> Liquidado</v-chip>
            </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Generar PDF" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="red" @click="abrirDialogPdf(item)">
                        mdi-file-pdf-box
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Generar excel" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="green" @click="exportarExcel(item.id)">
                        mdi-file-excel
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogOpcionesPdf" max-width="300px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title style="margin-bottom: 20px;">
                <span class="text-center">Opciones de PDF</span>
            </v-card-title>
            <v-col class="justify-center">
                <v-checkbox v-model="opcionesPdf" label="Resumen formularios" value="resumenF"></v-checkbox>
                <v-checkbox v-model="opcionesPdf" label="Mermas" value="mermas"></v-checkbox>
                <v-checkbox v-model="opcionesPdf" label="Detalle mermas" value="detalleM"></v-checkbox>
            </v-col>
            <v-card-actions>
                <v-btn color="secondary" variant="elevated" @click="generarPdf(liquidacionSeleccionada)">
                    Generar PDF
                    <template v-slot:append>
                        <v-icon color="red">mdi-file-pdf-box</v-icon>
                    </template>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogCargando" max-width="300px" persistent>
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="d-flex justify-center">
                <span class="text-center">{{ textoCargando }}</span>
            </v-card-title>
            <v-card-text class="d-flex justify-center">
                <v-col cols="10">
                    <v-progress-linear color="primary" indeterminate></v-progress-linear>
                </v-col>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Cajas totales', key: 'totalCajas', align: 'start', sortable: false },
            { title: 'Pago total', key: 'totalPago', align: 'start', sortable: false },
            { title: 'Pago final', key: 'totalFinal', align: 'start', sortable: false },
            { title: 'Fecha pre-liquidación', key: 'fechaPreliquidado', align: 'start', sortable: false },
            { title: 'Fecha liquidación', key: 'fechaLiquidado', align: 'start', sortable: false },
            { title: 'Estado', key: 'estado', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        acciones: [],
        tablas: [],
        search: '',
        filtroPrestador: null,
        filtroEstado: null,
        rangoFechaPre: ref([]),
        rangoFechaLiq: ref([]),
        dialogOpcionesPdf: false,
        liquidacionSeleccionada: null,
        opcionesPdf: ['resumenF', 'mermas', 'detalleM'],
        rol: null,
        rolesMomentaneo: [],
        rolAux: null,
        dialogCargando: false,
        textoCargando: ''
    }),
    computed: {
    },
    watch: {
        filtroPrestador() {
            this.search = String(Date.now());
        },
        filtroEstado() {
            this.search = String(Date.now());
        },
        rangoFechaPre() {
            this.search = String(Date.now());
        },
        rangoFechaLiq() {
            this.search = String(Date.now());
        },
        dialogOpcionesPdf() {
            this.opcionesPdf = ['resumenF', 'mermas', 'detalleM'];
        }
    },
    async created() {
        const user = JSON.parse(localStorage.getItem('user'));
        this.rol = user.rol;
        this.rolMomentaneo = user ? user.rolMomentaneo : [];
        //verificar que rolMomentaneo[0].fechaInicio < hoy < rolMomentaneo[0].fechaFin
        if (this.rolMomentaneo.length > 0) {
            const fechaInicio = new Date(this.rolMomentaneo[0].fechaInicio);
            const fechaFin = new Date(this.rolMomentaneo[0].fechaFin);
            const hoy = new Date();
            if (hoy >= fechaInicio && hoy <= fechaFin) {
                this.rolAux = this.rolMomentaneo[0].rol;
            }
        }
        this.filtroPrestador = user.prestador[0].prestadorId;
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/liquidaciones/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        prestadorId: this.filtroPrestador,
                        estado: this.filtroEstado,
                        fechaPreliquidacion: this.rangoFechaPre,
                        fechaLiquidacion: this.rangoFechaLiq
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.liquidados;
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
        async exportarExcel(id) {
            try {
                this.dialogCargando = true;
                this.textoCargando = 'Exportando a excel...';
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/liquidaciones/exportar/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            id
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Liquidación_${id}.xlsx`);
                        document.body.appendChild(link);
                        link.click();
                    }
                    ).catch((error) => {
                        console.error('Error al exportar a excel', error);
                    });
            } catch (error) {
                console.error('Error al exportar a excel', error);
            } finally {
                this.dialogCargando = false;
            }
        },
        abrirDialogPdf(item) {
            this.liquidacionSeleccionada = item;
            this.dialogOpcionesPdf = true;
        },
        async generarPdf(item) {
            try {
                this.dialogOpcionesPdf = false;
                this.dialogCargando = true;
                this.textoCargando = 'Generando PDF...';
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/liquidaciones/generarPdf/${item.id}`, {
                    responseType: 'blob',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        resumenF: this.opcionesPdf.includes('resumenF'),
                        mermas: this.opcionesPdf.includes('mermas'),
                        detalleM: this.opcionesPdf.includes('detalleM')
                    }
                }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Liquidación-${item.id}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }).catch((error) => {
                    console.error('Error al generar el pdf', error);
                    this.$notify({
                        text: 'Error al generar el pdf',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al generar el pdf', error);
                this.$notify({
                    text: 'Error al generar el pdf',
                    type: 'fallo'
                });
            } finally {
                this.dialogCargando = false;
            }
        },
        reniciarFechaPre() {
            this.rangoFechaPre = [];
        },
        reniciarFechaLiq() {
            this.rangoFechaLiq = [];
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
        formatearNumero(numero) {
            //pasar numero a string con $ y puntos cada 3 digitos
            return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

    }
};
</script>

<style></style>