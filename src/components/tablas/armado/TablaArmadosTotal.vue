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
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroEstado" multiple label="Estado"
                    :items="['Aprobado', 'Borrador', 'Anulado', 'Pre-liquidación', 'Liquidado']" clearable
                    chips></v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-locale-provider locale="es">
                    <v-date-input v-model="rangoFecha" label="Fecha armado" prepend-icon=""
                        append-inner-icon="$calendar" cancel-text="cancelar" multiple="range" ok-text="seleccionar"
                        clearable @click:clear="reniciarFecha()"></v-date-input>
                </v-locale-provider>
            </v-col>
        </v-row>
    </v-container>

    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        page-text="{0}-{1} de {2}" :items-length="totalItems" :loading="loading" :search="search" item-value="_id"
        @update:options="loadItems" items-per-page-text="Formularios de armado por página"
        loading-text="Cargando, por favor espere" :items-per-page-options="[10, 25, 50, totalItems]">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Formularios de armado<v-icon class="mx-2">mdi-form-select</v-icon></v-toolbar-title>
            </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Ver" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="abrirDialog(item)">
                        mdi-eye
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
            <div>
                <v-chip color="#26A69A" v-if="item.estado === 'aprobado'" variant="flat"> <v-icon icon="mdi-check-all"
                        start></v-icon> Aprobado</v-chip>
                <v-chip color="warning" v-if="item.estado === 'borrador'" variant="flat"> <v-icon icon="mdi-eraser"
                        start></v-icon> Borrador</v-chip>
                <v-chip color="red" v-if="item.estado === 'anulado'" variant="flat"> <v-icon icon="mdi-close-circle"
                        start></v-icon> Anulado</v-chip>
                <v-chip color="#42A5F5" v-if="item.estado === 'pre-liquidación'" variant="flat"> <v-icon
                        icon="mdi-cash-clock" start></v-icon> Pre-liquidación</v-chip>
                <v-chip color="green" v-if="item.estado === 'liquidado'" variant="flat"> <v-icon icon="mdi-cash-check"
                        start></v-icon> Liquidado</v-chip>
            </div>
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
        <template v-slot:[`item.fechaLiquidado`]="{ item }">
            <span v-if="item.fechaLiquidado">{{ formatearFecha(item.fechaLiquidado) }}</span>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialog" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">Vista previa formulario</span>
            </v-card-title>
            <v-card-text>
                <div class="details">
                    <!-- Folio, NV, Código -->
                    <div class="detail-item">
                        <p class="text-body-1"><strong>Folio:</strong> {{ formularioSeleccionado.nroFolio }}</p>
                        <p class="text-body-1"><strong>NV:</strong> {{ formularioSeleccionado.nv }}</p>
                        <p class="text-body-1"><strong>Código:</strong> {{ formularioSeleccionado.codCsf }}</p>
                        <p class="text-body-1"><strong>Estado:</strong>
                            <v-chip color="#26A69A" v-if="formularioSeleccionado.estado === 'aprobado'" variant="flat"> <v-icon
                                    icon="mdi-check-all" start></v-icon> Aprobado</v-chip>
                            <v-chip color="warning" v-if="formularioSeleccionado.estado === 'borrador'" variant="flat"> <v-icon
                                    icon="mdi-eraser" start></v-icon> Borrador</v-chip>
                            <v-chip color="red" v-if="formularioSeleccionado.estado === 'anulado'" variant="flat"> <v-icon
                                    icon="mdi-close-circle" start></v-icon> Anulado</v-chip>
                            <v-chip color="#42A5F5" v-if="formularioSeleccionado.estado === 'pre-liquidación'" variant="flat"> <v-icon
                                    icon="mdi-cash-clock" start></v-icon> Pre-liquidación</v-chip>
                            <v-chip color="green" v-if="formularioSeleccionado.estado === 'liquidado'" variant="flat"> <v-icon
                                    icon="mdi-cash-check" start></v-icon> Liquidado</v-chip>
                        </p>
                        <p class="text-body-1"><strong>Fecha armado:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaArmado) }}</p>
                        <p class="text-body-1"><strong>Fecha creación:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaCreacion) }}</p>
                        <p v-if="formularioSeleccionado.fechaAprobado" class="text-body-1"><strong>Fecha
                                aprobado:</strong>
                            {{
                                formatearFecha(formularioSeleccionado.fechaAprobado) }}</p>
                        <p v-if="formularioSeleccionado.fechaPreliquidado" class="text-body-1"><strong>Fecha
                                preliquidado:</strong>
                            {{
                                formatearFecha(formularioSeleccionado.fechaPreliquidado) }}</p>
                        <p v-if="formularioSeleccionado.fechaLiquidado" class="text-body-1"><strong>Fecha
                                liquidado:</strong> {{
                                    formatearFecha(formularioSeleccionado.fechaLiquidado) }}</p>
                        <p v-if="formularioSeleccionado.usuario" class="text-body-1"><strong>Digitador:</strong>
                            {{
                                formularioSeleccionado.usuario.nombre }},
                            {{
                                formularioSeleccionado.usuario.correo }}</p>
                        <p v-if="formularioSeleccionado.temporada" class="text-body-1"><strong>Temporada:</strong>
                            {{ formularioSeleccionado.temporada.nombre }}
                        </p>
                        <p v-if="formularioSeleccionado.prestador" class="text-body-1"><strong>Prestador:</strong>
                            {{ formularioSeleccionado.prestador.nombreCorto }}
                        </p>
                        <p v-if="formularioSeleccionado.lugarArmado" class="text-body-1"><strong>Lugar de
                                armado:</strong>
                            {{ formularioSeleccionado.lugarArmado.nombre }}
                        </p>
                    </div>

                    <!-- Guía CSF y RUT Cliente -->
                    <div class="detail-item" v-if="formularioSeleccionado.guiaCsf">
                        <p class="text-body-1"><strong>Guía CSF:</strong> {{ formularioSeleccionado.guiaCsf }}</p>
                        <p class="text-body-1"><strong>RUT Cliente:</strong> {{ formularioSeleccionado.rutCliente }}</p>
                    </div>

                    <!-- Cajas Totales, Buenas y Mermas -->
                    <div class="detail-item">
                        <p v-if="formularioSeleccionado.cajasTotales" class="text-body-1"><strong>Cajas
                                Totales:</strong> {{
                            formularioSeleccionado.cajasTotales }}
                        </p>
                        <p class="text-body-1"><strong>Cajas Buenas:</strong> {{ formularioSeleccionado.cajasBuenas }}
                        </p>
                        <p v-if="formularioSeleccionado.mermasTotales" class="text-body-1"><strong>Mermas
                                Totales:</strong>
                            {{ formularioSeleccionado.mermasTotales
                            }}
                        </p>
                    </div>

                    <!-- Detalles de Mermas -->
                    <template v-if="formularioSeleccionado.mermasTotales || formularioSeleccionado.mermasTotales > 0">
                        <div class="detail-item">
                            <p class="text-body-1"><strong>Mermas Armado:</strong> {{
                                formularioSeleccionado.mermasArmado }}</p>
                            <p class="text-body-1"><strong>Mermas Fabricación:</strong> {{
                                formularioSeleccionado.mermasFabricacion }}</p>
                            <p class="text-body-1"><strong>Mermas Almacenaje:</strong> {{
                                formularioSeleccionado.mermasAlmacenaje }}</p>
                        </div>
                        <div class="detail-item">
                            <p class="text-body-1"><strong>Mermas Otros:</strong> {{
                                formularioSeleccionado.mermasOtros }}</p>
                            <p class="text-body-1"><strong>No Pasadas por Máquina:</strong> {{
                                formularioSeleccionado.noPasadasPorMaquina }}</p>
                        </div>
                    </template>

                    <!-- Servicios -->
                    <div v-if="serviciosFormateados.length > 0" class="detail-item">
                        <p class="text-body-1"><strong>Servicios:</strong></p>
                        <li v-for="servicio in serviciosFormateados" :key="servicio.id">
                            {{ servicio }}
                        </li>
                    </div>

                    <!-- Máquina y Adhesivo -->
                    <div class="detail-item">
                        <p v-if="formularioSeleccionado.maquina" class="text-body-1"><strong>Máquina:</strong> {{
                            formularioSeleccionado.maquina.nmaquina }}</p>
                        <p v-if="formularioSeleccionado.maquinaExterna" class="text-body-1"><strong>Máquina
                                externa:</strong> {{
                                    formularioSeleccionado.maquinaExterna }}
                        </p>
                        <div v-if="formularioSeleccionado.adhesivo">
                            <p class="text-body-1"><strong>Adhesivo:</strong> {{ formularioSeleccionado.adhesivo.codigo
                            }} -
                                {{
                                    formularioSeleccionado.adhesivo.descripcion }}</p>
                            <p class="text-body-1"><strong>Cantidad adhesivo:</strong> {{
                                formularioSeleccionado.kilosAdhesivo
                            }} kg</p>
                        </div>

                    </div>

                    <!-- Observaciones -->
                    <div v-if="formularioSeleccionado.observaciones" class="detail-item">
                        <p class="text-body-1"><strong>Observaciones:</strong> {{ formularioSeleccionado.observaciones
                        }}
                        </p>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="close()">
                    Cerrar
                </v-btn>
            </v-card-actions>
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
            { title: 'Prestador', key: 'prestador.nombreCorto', align: 'start', sortable: false },
            { title: 'Lugar de armado', key: 'lugarArmado.nombre', align: 'start', sortable: false },
            { title: 'Temporada', key: 'temporada.nombre', align: 'start', sortable: false },
            { title: 'Fecha armado', key: 'fechaArmado', align: 'start', },
            { title: 'Fecha creación', key: 'fechaCreacion', align: 'start', },
            { title: 'Fecha aprobado', key: 'fechaAprobado', align: 'start', },
            { title: 'Fecha preliquidado', key: 'fechaPreliquidado', align: 'start', },
            { title: 'Fecha liquidado', key: 'fechaLiquidado', align: 'start', },
            { title: 'Estado', key: 'estado', align: 'start', },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        search: '',
        formularioSeleccionado: {
            usuario: {
                nombre: '',
                correo: '',
            },
            folio: {
                temporada: {
                    nombre: '',
                },
            },
        },
        defaultItem: {
            usuario: {
                nombre: '',
                correo: '',
            },
            folio: {
                temporada: {
                    nombre: '',
                },
            }
        },
        editedIndex: -1,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        dialog: false,
        filtroEstado: null,
        prestadores: [],
        filtroPrestador: null,
        filtroLugar: null,
        lugares: [],
        rangoFecha: ref([]),
    }),
    watch: {
        filtroEstado() {
            this.search = String(Date.now());
        },
        filtroPrestador() {
            this.search = String(Date.now());
            this.onPrestadorChange(this.filtroPrestador);
        },
        rangoFecha() {
            this.search = String(Date.now());
        },
        filtroLugar() {
            this.search = String(Date.now());
        },

    },
    computed: {
        // Formatea los servicios para mostrarlos en la vista previa
        serviciosFormateados() {
            return this.formularioSeleccionado.servicios.map(servicio => {
                return `${servicio.servicio.codigo} - ${servicio.servicio.descripcion} - 
                Rango 1: $${servicio.precio1} CLP - Rango 2: $${servicio.precio2} CLP`;
            });
        }
    },
    async mounted() {
        await this.obtenerPrestadores();
    },
    methods: {
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
        reniciarFecha() {
            this.rangoFecha = [];
        },
        async loadItems({ page, itemsPerPage, sortBy } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/armados/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page,
                        sortBy,
                        estado: this.filtroEstado,
                        prestadorId: this.filtroPrestador,
                        fecha: this.rangoFecha,
                        lugarArmadoId: this.filtroLugar,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.armados;
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
        abrirDialog(item) {
            this.dialog = true;
            this.formularioSeleccionado = item;
            this.editedIndex = this.serverItems.indexOf(item);
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedIndex = -1;
            });
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
    }
};
</script>

<style></style>