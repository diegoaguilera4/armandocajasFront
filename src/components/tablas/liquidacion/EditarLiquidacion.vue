<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        :items-per-page-options="[10, 25, 50, totalItems]" items-per-page-text="Formularios por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title v-if="estadoLiquidacion === 'liquidado'">Liquidación ID {{ this.$route.params.id }} de
                    {{ this.$route.params.nombre }} <v-icon class="mx-2">mdi-cash-check</v-icon></v-toolbar-title>
                <v-toolbar-title v-if="estadoLiquidacion !== 'liquidado'">Pre-liquidación ID {{ this.$route.params.id }}
                    de {{ this.$route.params.nombre }} <v-icon class="mx-2">mdi-cash-check</v-icon></v-toolbar-title>
                <v-btn color="secondary" variant="elevated" style="margin-right: 20px" @click="abrirDialogPdf()">
                    Generar PDF
                    <template v-slot:append>
                        <v-icon color="red">mdi-file-pdf-box</v-icon>
                    </template>
                </v-btn>
                <v-btn append-icon="mdi-file-excel" variant="elevated" color="green" style="margin-right: 20px" @click="exportarExcel()">
                    Generar excel
                </v-btn>
                <v-btn v-if="mostrarLiquidar  && (rol === 'revisor superior' || rolAux === 'revisor superior') && estadoLiquidacion !== 'liquidado'" color="secondary"
                    variant="elevated" append-icon="mdi-cash-check" style="margin-right: 20px"
                    @click="abrirDialogLiquidar()">
                    Liquidar
                </v-btn>
            </v-toolbar>
        </template>
        <template v-slot:[`item.fechaCreacion`]="{ item }">
            <span>{{ formatearFecha(item.fechaCreacion) }}</span>
        </template>
        <template v-slot:[`item.fechaArmado`]="{ item }">
            <span>{{ formatearFecha(item.fechaArmado) }}</span>
        </template>
        <template v-slot:[`item.fechaAprobado`]="{ item }">
            <span v-if="item.fechaAprobado">{{ formatearFecha(item.fechaAprobado) }}</span>
        </template>
        <template v-slot:[`item.fechaPreliquidado`]="{ item }">
            <span v-if="item.fechaPreliquidado">{{ formatearFecha(item.fechaPreliquidado) }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip v-if="estadoLiquidacion !== 'liquidado'" text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editarFormulario(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="estadoLiquidacion !== 'liquidado'" text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="red" @click="abrirDialogEliminar(item)">
                        mdi-delete
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
                <v-btn color="secondary" variant="elevated" @click="generarPdf()">
                    Generar PDF
                    <template v-slot:append>
                        <v-icon color="red">mdi-file-pdf-box</v-icon>
                    </template>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogLiquidar" max-width="400px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                ¿Estás seguro que deseas liquidar?
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="dialogLiquidar = false">
                    Cancelar
                </v-btn>
                <v-btn color="primary" variant="elevated" @click="liquidar()">
                    Generar liquidación
                    <template v-slot:append>
                        <v-icon>mdi-cash-check</v-icon>
                    </template>
                </v-btn>
                <v-spacer></v-spacer>

            </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- dialog eliminar form -->
    <v-dialog v-model="dialogEliminar" max-width="500px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                <span class="text-h6 text-wrap">
                    ¿Estás seguro que deseas eliminar el formulario {{ liquidacionSeleccionada.nroFolio }}?
                </span>
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="dialogEliminar = false">
                    Cancelar
                </v-btn>
                <v-btn color="primary" variant="elevated" @click="eliminarFormulario()">
                    Eliminar
                    <template v-slot:append>
                        <v-icon>mdi-delete</v-icon>
                    </template>
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
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
            { title: 'ID', key: 'id', align: 'start' },
            { title: 'Folio', key: 'nroFolio', align: 'start' },
            { title: 'Guía', key: 'guiaCsf', align: 'start', },
            { title: 'NV', key: 'nv', align: 'start', },
            { title: 'Código', key: 'codCsf', align: 'start', },
            { title: 'Rut cliente', key: 'rutCliente', align: 'start', },
            { title: 'Total', key: 'cajasTotales', align: 'start', },
            { title: 'Buenas', key: 'cajasBuenas', align: 'start', },
            { title: 'Mermas', key: 'mermasTotales', align: 'start', },
            { title: 'Lugar de armado', key: 'lugarArmado.nombre', align: 'start', sortable: false },
            { title: 'Temporada', key: 'temporada.nombre', align: 'start', sortable: false },
            { title: 'Fecha armado', key: 'fechaArmado', align: 'start', },
            { title: 'Fecha creación', key: 'fechaCreacion', align: 'start', },
            { title: 'Fecha aprobado', key: 'fechaAprobado', align: 'start', },
            { title: 'Fecha preliquidado', key: 'fechaPreliquidado', align: 'start', },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
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
        rangoFecha: ref([]),
        dialogOpcionesPdf: false,
        dialogLiquidar: false,
        dialogEliminar: false,
        liquidacionSeleccionada: null,
        opcionesPdf: ['resumenF', 'mermas', 'detalleM'],
        rol: null,
        rolMomentaneo: null,
        rolAux: null,
        loadingConfirmar: false,
        liquidacion: null,
        estadoLiquidacion: '',
        mostrarLiquidar: false,
        items: [
            {
                title: 'Liquidaciones',
                disabled: false,
                href: '/liquidaciones',
            },
            {
                title: `Editar liquidación`,
                disabled: true,
                href: '',
            },
        ],
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
        rangoFecha() {
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
        await this.obtenerLiquidacion();
        this.mostrarLiquidar = true;
    },
    methods: {
        async obtenerLiquidacion() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/liquidaciones/${this.$route.params.id}`, {
                    params: {
                        take: 1,
                        page: 1,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.estadoLiquidacion = response.data.liquidacion.estado;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                    this.$router.push('/liquidaciones');

                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
                //redirigir a liquidaciones
                this.$router.push('/liquidaciones');
            }
        },
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/liquidaciones/${this.$route.params.id}`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.liquidacion = response.data.liquidacion;
                    this.serverItems = response.data.liquidacion.armados;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                    this.$router.push('/liquidaciones');

                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
                this.$router.push('/liquidaciones');

            } finally {
                this.loading = false;
            }
        },
        abrirDialogEliminar(item) {
            this.dialogEliminar = true;
            this.liquidacionSeleccionada = item;
        },
        async eliminarFormulario() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }

                await axios.post(`/liquidaciones/eliminarFormulario/${this.$route.params.id}/${this.liquidacionSeleccionada.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.serverItems = this.serverItems.filter((item) => item.id !== this.liquidacionSeleccionada.id);
                    this.totalItems = this.totalItems - 1;
                    if(this.totalItems === 0) {
                        this.$notify({
                            text: 'Liquidación eliminada con éxito',
                            type: 'exito'
                        })
                        this.$router.push('/liquidaciones');
                    }
                    this.dialogEliminar = false;
                    this.$notify({
                        text: 'Formulario eliminado con éxito',
                        type: 'exito'
                    });
                }).catch((error) => {
                    console.error('Error al eliminar el formulario', error);
                    this.$notify({
                        text: 'Error al eliminar el formulario',
                        type: 'fallo'
                    });
                });

            } catch (error) {
                console.error('Error al eliminar el formulario', error);
                this.$notify({
                    text: 'Error al eliminar el formulario',
                    type: 'fallo'
                });
            }
        },
        editarFormulario(item) {
            this.$router.push('/formularioPreliquidado/' + item.id);
        },
        abrirDialogLiquidar() {
            this.dialogLiquidar = true;
        },
        abrirDialogPdf() {
            this.dialogOpcionesPdf = true;
        },
        async liquidar() {
            try {
                this.dialogLiquidar = false;
                this.loadingConfirmar = true;
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/liquidaciones/liquidar/${this.$route.params.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
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
                this.$router.push('/liquidaciones');
            }
        },
        async exportarExcel() {
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
                            id: this.$route.params.id
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Liquidación_${this.$route.params.id}.xlsx`);
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
        async generarPdf() {
            try {
                this.dialogOpcionesPdf = false;
                this.dialogCargando = true;
                this.textoCargando = 'Generando PDF...';
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/liquidaciones/generarPdf/${this.$route.params.id}`, {
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
                    link.setAttribute('download', `Liquidación-${this.liquidacion.id}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    this.dialogOpcionesPdf = false;
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
        formatearFecha(fecha) {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false
            });
        },
    }
};
</script>

<style></style>