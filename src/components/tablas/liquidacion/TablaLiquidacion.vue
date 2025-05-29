<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="3" md="3" sm="4">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Filtrar por prestador" chips
                    clearable :items="prestadores" item-title="nombreCorto" item-value="id">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                    </template>
                </v-select>
            </v-col>
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
                <v-dialog v-model="dialogImportar" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-file-excel" variant="elevated" color="secondary"
                            style="margin-right: 20px; margin-left: 10px;" dark v-bind="props">
                            Importar
                        </v-btn>
                        <v-btn append-icon="mdi-file-excel" variant="elevated" color="green"
                            style="margin-right: 20px;" dark @click="exportarLiquidacionesExcel()">
                            Exportar
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">Importar liquidación desde excel</span>
                        </v-card-title>
                        <v-file-upload v-model="file" clearable density="compact" variant="compact"
                            title="Seleccione archivo (.xlsx)"></v-file-upload>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="cerrarImportar">
                                Cancelar
                            </v-btn>
                            <v-btn color="primary" :disabled="!file" variant="elevated" @click="importar">
                                Importar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
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
            <v-tooltip text="Liquidar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon
                        v-if="item.estado !== 'liquidado' && (rol === 'revisor superior' || rolAux === 'revisor superior')"
                        v-bind="props" class="me-2" size="large" color="#689F38" @click="abrirDialogLiquidar(item)">
                        mdi-cash-check
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="(rol === 'revisor superior' || rolAux === 'revisor superior' || rol == 'revisor csf')"
                text="Ver detalle" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#2196F3" @click="mostrarDetalle(item)">
                        mdi-eye
                    </v-icon>
                </template>
            </v-tooltip>
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
            <v-tooltip text="Cancelar liquidación" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="red" @click="abrirDialogCancelar(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogLiquidar" max-width="1200px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title style="margin-bottom: 20px;">
                <span class="text-center">Detalle liquidación {{ liquidacionSeleccionada.id }} de {{
                    liquidacionSeleccionada.prestadorNombre }}</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-data-table density="compact" :headers="headersArmados" :items="liquidacionSeleccionada.armados"
                items-per-page-text="Formularios por página" page-text="{0}-{1} de {2}" style="margin-top: 20px;">

                <template v-slot:[`item.fechaCreacion`]="{ item }">
                    <span>{{ formatearFecha(item.fechaCreacion) }}</span>
                </template>
                <template v-slot:[`item.fechaArmado`]="{ item }">
                    <span>{{ formatearFechaV2(item.fechaArmado) }}</span>
                </template>
                <template v-slot:[`item.kilosAdhesivo`]="{ item }">
                    <span>{{ item.kilosAdhesivo }} kg</span>
                </template>
                <template v-slot:[`item.maquina`]="{ item }">
                    <span v-if="item.maquina">{{ item.maquina.nmaquina }} </span>
                    <span v-if="item.maquinaExterna"> {{ item.maquinaExterna }}</span>
                </template>
                <template v-slot:[`item.adhesivo`]="{ item }">
                    <span v-if="item.adhesivo">{{ item.adhesivo.codigo }} </span>
                    <span v-if="item.maquinaExterna"> {{ item.adhesivoExterno }}</span>
                </template>
            </v-data-table>
            <v-card-actions>
                <v-btn color="primary" variant="elevated" @click="liquidar(liquidacionSeleccionada)">
                    Generar liquidación
                    <template v-slot:append>
                        <v-icon>mdi-cash-check</v-icon>
                    </template>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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
    <!-- dialog cancelar -->
    <v-dialog v-model="dialogCancelar" max-width="500px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                <span class="text-h6 text-wrap">¿Está seguro de cancelar la liquidación?</span>
                <span class="text-h6 text-wrap">Liquidación {{ liquidacionSeleccionada.id }} del prestador {{ liquidacionSeleccionada.prestadorNombre }}</span>
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="red" text variant="elevated" @click="dialogCancelar = false">
                    Cancelar
                </v-btn>
                <v-btn color="primary" text variant="elevated" @click="cancelarLiquidacion(liquidacionSeleccionada)">
                    Confirmar
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
        
    </v-dialog>
    <v-dialog max-width="400px" v-model="loadingImportar" persistent>
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="d-flex justify-center">
                <span class="text-center">Importando liquidación...</span>
            </v-card-title>
            <v-card-text class="d-flex justify-center">
                <v-col cols="10">
                    <v-progress-linear color="primary" indeterminate></v-progress-linear>
                </v-col>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog max-width="400px" v-model="loadingConfirmar" persistent>
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="d-flex justify-center">
                <span class="text-center">Enviando liquidación...</span>
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
            { title: 'Factura', key: 'nroFactura', align: 'start', sortable: false },
            { title: 'Prestador nombre', key: 'prestadorNombre', align: 'start', sortable: false },
            { title: 'Prestador RUT', key: 'prestadorRut', align: 'start', sortable: false },
            { title: 'Cajas totales', key: 'totalCajas', align: 'start', sortable: false },
            { title: 'Pago total', key: 'totalPago', align: 'start', sortable: false },
            { title: 'Pago final', key: 'totalFinal', align: 'start', sortable: false },
            { title: 'Fecha pre-liquidación', key: 'fechaPreliquidado', align: 'start', sortable: false },
            { title: 'Fecha liquidación', key: 'fechaLiquidado', align: 'start', sortable: false },
            { title: 'Estado', key: 'estado', align: 'start', sortable: false },
        ],
        headersArmados: [
            { title: 'Folio', key: 'nroFolio' },
            //{ title: 'Cajas totales', key: 'cajasTotales' },
            { title: 'Cajas buenas', key: 'cajasBuenas' },
            // { title: 'Mermas totales', key: 'mermasTotales' },
            { title: 'Nombre cliente', key: 'nombreCliente' },
            { title: 'Lugar de armado', key: 'lugarArmado.nombre' },
            { title: 'Fecha armado', key: 'fechaArmado' },
            { title: 'Fecha creación', key: 'fechaCreacion' },
            { title: 'Máquina', key: 'maquina' },
            { title: 'Adhesivo', key: 'adhesivo' },
            { title: 'Kilos adhesivo', key: 'kilosAdhesivo' },
        ],
        serverItems: [],
        loading: true,
        loadingImportar: false,
        totalItems: 0,
        filtroAccion: null,
        filtroTabla: null,
        acciones: [],
        tablas: [],
        search: '',
        editedItem: {
        },
        defaultItem: {
        },
        prestadores: [],
        filtroPrestador: null,
        filtroEstado: null,
        rangoFechaPre: ref([]),
        rangoFechaLiq: ref([]),
        dialogOpcionesPdf: false,
        dialogLiquidar: false,
        dialogCancelar: false,
        dialogImportar: false,
        liquidacionSeleccionada: null,
        opcionesPdf: ['resumenF', 'mermas', 'detalleM'],
        rol: null,
        rolesMomentaneo: [],
        rolAux: null,
        loadingConfirmar: false,
        dialogCargando: false,
        textoCargando: '',
        file: null
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
        await this.obtenerPrestadores();
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
    },
    methods: {
        async exportarLiquidacionesExcel() {
            try {
                this.dialogCargando = true;
                this.textoCargando = 'Exportando a excel...';
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/liquidaciones/exportarResumen/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'Liquidaciones.xlsx');
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
                this.textoCargando = '';
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
                this.textoCargando = '';
            }
        },
        cerrarImportar() {
            this.dialogImportar = false;
            this.file = null;
        },
        validarArchivo() {
            if (this.file === null) {
                this.$notify({
                    text: 'Debe seleccionar un archivo',
                    type: 'fallo'
                });
                return false;
            }
            //verificar que el nombre termine con .xlsx
            if (!this.file.name.endsWith('.xlsx')) {
                this.$notify({
                    text: 'El archivo debe ser de tipo .xlsx',
                    type: 'fallo'
                });
                return false;
            }
            return true;
        },
        async importar() {
            try {
                this.dialogImportar = false;
                this.loadingImportar = true;
                if (!this.validarArchivo()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post('/upload/liquidaciones', { file: this.file }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }).then((response) => {
                    if(response.data.status === 404){
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        this.file = null;
                        this.loadingImportar = false;
                        return;
                    }
                    this.$notify({
                        text: 'Liquidacion importada con éxito',
                        type: 'exito'
                    });
                    this.dialogImportar = false;
                    this.file = null;
                    this.search = String(Date.now());
                }).catch((error) => {
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                    this.file = null;
                    this.loadingImportar = false;
                    console.error('Error al importar', error);
                });
            } catch (error) {
                console.error('Error al importar', error);
            } finally {
                this.loadingImportar = false;
            }
        },
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
        abrirDialogCancelar(item) {
            this.liquidacionSeleccionada = item;
            this.dialogCancelar = true;
        },
        async cancelarLiquidacion(item) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/liquidaciones/cancelar/${item.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    //eliminar la liquidacion de la tabla
                    this.serverItems = this.serverItems.filter((liquidacion) => liquidacion.id !== item.id);
                    this.totalItems = this.totalItems - 1;
                    this.dialogCancelar = false;
                    this.$notify({
                        text: 'Liquidación cancelada con éxito',
                        type: 'exito'
                    });
                }).catch((error) => {
                    console.error('Error al cancelar la liquidación', error);
                });
            } catch (error) {
                console.error('Error al cancelar la liquidación', error);
            }
        },
        abrirDialogPdf(item) {
            this.liquidacionSeleccionada = item;
            this.dialogOpcionesPdf = true;
        },
        abrirDialogLiquidar(item) {
            this.liquidacionSeleccionada = item;
            this.dialogLiquidar = true;
        },
        async liquidar(item) {
            try {
                this.dialogLiquidar = false;
                this.loadingConfirmar = true;
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/liquidaciones/liquidar/${item.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if(response.data.status === 404){
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return;
                    }
                    this.$notify({
                        text: 'Liquidación realizada con éxito',
                        type: 'exito'
                    });
                    this.search = String(Date.now());
                }).catch((error) => {
                    console.error('Error al liquidar', error);
                    this.$notify({
                        text: 'Error al liquidar',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al liquidar', error);
                this.$notify({
                    text: 'Error al liquidar',
                    type: 'fallo'
                });
            } finally {
                this.loadingConfirmar = false;
            }
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
                    link.setAttribute('download', `Liquidacion-${item.id}.pdf`);
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
        mostrarDetalle(item) {
            this.$router.push('/liquidacion/' + item.id + '/' + item.prestadorNombre);
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
        formatearFechaV2(fecha) {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
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
        formatearNumero(numero) {
            //pasar numero a string con $ y puntos cada 3 digitos
            return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

    }
};
</script>

<style></style>