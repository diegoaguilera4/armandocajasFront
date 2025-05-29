<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Prestador" chips
                    :items="prestadores" item-title="nombreCorto" item-value="id" @change="onPrestadorChange">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="6" v-if="lugares.length > 0">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroLugar" label="Lugar de armado" chips clearable
                    :items="lugares" item-title="nombre" item-value="id">
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-select prepend-inner-icon="mdi-magnify" v-model="filtroTemporada" label="Temporada" chips
                    :items="temporadas" item-title="nombre" item-value="id" clearable>
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props"
                            :subtitle="'Inicio: ' + formatearDia(item.raw.inicio) + ' - ' + 'Fin: ' + formatearDia(item.raw.fin)"></v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="filtroCliente" label="RUT Cliente" clearable>
                </v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-locale-provider locale="es">
                    <v-date-input v-model="rangoFecha" label="Fecha armado" prepend-icon=""
                        append-inner-icon="$calendar" cancel-text="cancelar" multiple="range" ok-text="seleccionar"
                        clearable @click:clear="reniciarFecha()"></v-date-input>
                </v-locale-provider>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-if="filtroPrestador" v-model:items-per-page="itemsPerPage"  v-model:sort-by="sortBy" :headers="headers"
        :items="serverItems" :items-length="totalItems" :loading="loading" :search="search" item-value="_id"
        @update:options="loadItems" items-per-page-text="Formularios de armado por página"
        loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Formularios de armado<v-icon class="mx-2">mdi-form-select</v-icon></v-toolbar-title>
                <v-btn :disabled="!selectedColumns.length > 0" color="secondary" variant="elevated"
                    append-icon="mdi-cash-clock" style="margin-right: 20px" @click="abrirDialogConfirmar()">
                    Pre-liquidar
                </v-btn>
            </v-toolbar>
        </template>
        <template v-slot:[`header.seleccionar`]="{ }">
            <v-checkbox style="display: flex; align-items: center;" v-model="allSelected"
                @change="toggleAllColumns"></v-checkbox>
        </template>
        <template v-slot:[`item.seleccionar`]="{ item }">
            <v-checkbox style="display: flex; align-items: center;" v-if="item.estado === 'aprobado'"
                v-model="item.selected" @change="toggleColumn(item)"></v-checkbox>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Ver" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#FDD835" @click="abrirDetalle(item)">
                        mdi-eye
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="item.estado !== 'liquidado'" text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editarFormulario(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Anular" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="red" @click="abrirDialogAnular(item)">
                        mdi-file-cancel
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
            <div>
                <v-chip color="#26A69A" v-if="item.estado === 'aprobado'" variant="flat"> <v-icon icon="mdi-check-all"
                        start></v-icon> Aprobado</v-chip>
            </div>
        </template>
        <template v-slot:[`item.fechaCreacion`]="{ item }">
            <span>{{ formatearFecha(item.fechaCreacion) }}</span>
        </template>
        <template v-slot:[`item.fechaArmado`]="{ item }">
            <span>{{ formatearFecha(item.fechaArmado) }}</span>
        </template>
        <template v-slot:[`item.fechaAprobado`]="{ item }">
            <span>{{ formatearFecha(item.fechaAprobado) }}</span>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogDetalle" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">Formulario</span>
            </v-card-title>
            <v-card-text>
                <div class="details">
                    <!-- Folio, NV, Código -->
                    <div class="detail-item">
                        <p class="text-body-1"><strong>Folio:</strong> {{ formularioSeleccionado.nroFolio }}</p>
                        <p class="text-body-1"><strong>NV:</strong> {{ formularioSeleccionado.nv }}</p>
                        <p class="text-body-1"><strong>Código:</strong> {{ formularioSeleccionado.codCsf }}</p>
                        <p class="text-body-1"><strong>Fecha armado:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaArmado) }}</p>
                        <p class="text-body-1"><strong>Fecha creación:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaCreacion) }}</p>
                        <p v-if="formularioSeleccionado.fechaPreliquidado" class="text-body-1"><strong>Fecha
                                preliquidado:</strong> {{
                                    formatearFecha(formularioSeleccionado.fechaPreliquidado) }}</p>
                        <p class="text-body-1"><strong>Digitador:</strong> {{ formularioSeleccionado.usuario.nombre }},
                            {{
                                formularioSeleccionado.usuario.correo }}</p>
                        <p class="text-body-1"><strong>Temporada:</strong>
                            {{ formularioSeleccionado.folio.temporada.nombre }}
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
                        <p class="text-body-1"><strong>Cajas Totales:</strong> {{ formularioSeleccionado.cajasTotales }}
                        </p>
                        <p class="text-body-1"><strong>Cajas Buenas:</strong> {{ formularioSeleccionado.cajasBuenas }}
                        </p>
                        <p class="text-body-1"><strong>Mermas Totales:</strong> {{ formularioSeleccionado.mermasTotales
                            }}
                        </p>
                    </div>

                    <!-- Detalles de Mermas -->
                    <template v-if="formularioSeleccionado.mermasTotales > 0">
                        <div class="detail-item">
                            <p class="text-body-1"><strong>Mermas Armado:</strong> {{
                                formularioSeleccionado.mermasArmado }}</p>
                            <p class="text-body-1"><strong>Mermas Fabricación:</strong> {{
                                formularioSeleccionado.mermasFabricacion }}</p>
                            <p class="text-body-1"><strong>Mermas Almacenaje:</strong> {{
                                formularioSeleccionado.mermasAlmacenaje }}</p>
                        </div>
                        <div class="detail-item">
                            <p class="text-body-1"><strong>Mermas otros:</strong> {{
                                formularioSeleccionado.mermasOtros }}</p>
                            <p class="text-body-1"><strong>No Pasadas por Máquina:</strong> {{
                                formularioSeleccionado.noPasadasPorMaquina }}</p>
                        </div>
                    </template>

                    <!-- Servicios -->
                    <div class="detail-item">
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
                        <p v-if="formularioSeleccionado.adhesivo" class="text-body-1">
                            <strong>Adhesivo:</strong> {{
                                formularioSeleccionado.adhesivo.codigo }} -
                            {{
                                formularioSeleccionado.adhesivo.descripcion }}
                        </p>
                        <p v-if="formularioSeleccionado.adhesivoExterno" class="text-body-1">
                            <strong>Adhesivo externo:</strong> {{ formularioSeleccionado.adhesivoExterno }}
                        </p>
                        <p class="text-body-1"><strong>Cantidad adhesivo:</strong> {{
                            formularioSeleccionado.kilosAdhesivo
                        }} kg</p>
                    </div>

                    <!-- Observaciones -->
                    <div class="detail-item">
                        <p class="text-body-1"><strong>Observaciones:</strong> {{ formularioSeleccionado.observaciones
                            }}
                        </p>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogConfirmar" max-width="1200px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <div v-if="!loadingConfirmar">
                <v-card-title>
                    <span class="text-center">¿Está seguro que desea pre-liquidar estos formularios?</span>
                </v-card-title>
                <v-card-text v-if="selectedColumns[0]" style="margin: 20px;">
                    <v-row>
                        <h3>
                            <strong>Prestador: {{ selectedColumns[0].lugarArmado.prestador.nombre }}</strong>
                        </h3>
                    </v-row>
                </v-card-text>
                <v-data-table density="compact" :headers="headersSeleccionados" :items="selectedColumns"
                    items-per-page-text="Formularios por página" page-text="{0}-{1} de {2}" style="margin-top: 20px;">
                    <template v-slot:[`item.fechaCreacion`]="{ item }">
                        <span>{{ formatearFecha(item.fechaCreacion) }}</span>
                    </template>
                    <template v-slot:[`item.fechaArmado`]="{ item }">
                        <span>{{ formatearFecha(item.fechaArmado) }}</span>
                    </template>
                    <template v-slot:[`item.fechaAprobado`]="{ item }">
                        <span>{{ formatearFecha(item.fechaAprobado) }}</span>
                    </template>
                </v-data-table>
            </div>

            <v-card-actions v-if="!loadingConfirmar">
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="dialogConfirmar = false">
                    Cancelar
                </v-btn>
                <v-btn color="primary" variant="elevated" @click="preliquidarFormularios()">
                    Pre-liquidar formularios
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogAnular" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">¿Desea anular este formulario?</span>
            </v-card-title>
            <v-card-text>
                <div class="details">
                    <!-- Folio, NV, Código -->
                    <div class="detail-item">
                        <p class="text-body-1"><strong>Folio:</strong> {{ formularioSeleccionado.nroFolio }}</p>
                        <p class="text-body-1"><strong>NV:</strong> {{ formularioSeleccionado.nv }}</p>
                        <p class="text-body-1"><strong>Código:</strong> {{ formularioSeleccionado.codCsf }}</p>
                        <p class="text-body-1"><strong>Fecha armado:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaArmado) }}</p>
                        <p class="text-body-1"><strong>Fecha creación:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaCreacion) }}</p>
                        <p class="text-body-1"><strong>Fecha aprobado:</strong> {{
                            formatearFecha(formularioSeleccionado.fechaAprobado) }}</p>
                        <p class="text-body-1"><strong>Digitador:</strong> {{ formularioSeleccionado.usuario.nombre }},
                            {{
                                formularioSeleccionado.usuario.correo }}</p>
                        <p class="text-body-1"><strong>Temporada:</strong>
                            {{ formularioSeleccionado.folio.temporada.nombre }}
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
                        <p class="text-body-1"><strong>Cajas Totales:</strong> {{ formularioSeleccionado.cajasTotales }}
                        </p>
                        <p class="text-body-1"><strong>Cajas Buenas:</strong> {{ formularioSeleccionado.cajasBuenas }}
                        </p>
                        <p class="text-body-1"><strong>Mermas Totales:</strong> {{ formularioSeleccionado.mermasTotales
                        }}
                        </p>
                    </div>

                    <!-- Detalles de Mermas -->
                    <template v-if="formularioSeleccionado.mermasTotales > 0">
                        <div class="detail-item">
                            <p class="text-body-1"><strong>Mermas Armado:</strong> {{
                                formularioSeleccionado.mermasArmado }}</p>
                            <p class="text-body-1"><strong>Mermas Fabricación:</strong> {{
                                formularioSeleccionado.mermasFabricacion }}</p>
                            <p class="text-body-1"><strong>Mermas Almacenaje:</strong> {{
                                formularioSeleccionado.mermasAlmacenaje }}</p>
                        </div>
                        <div class="detail-item">
                            <p class="text-body-1"><strong>Mermas otros:</strong> {{
                                formularioSeleccionado.mermasOtros }}</p>
                            <p class="text-body-1"><strong>No Pasadas por Máquina:</strong> {{
                                formularioSeleccionado.noPasadasPorMaquina }}</p>
                        </div>
                    </template>

                    <!-- Servicios -->
                    <div class="detail-item">
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
                        <p v-if="formularioSeleccionado.adhesivo" class="text-body-1">
                            <strong>Adhesivo:</strong> {{
                                formularioSeleccionado.adhesivo.codigo }} -
                            {{
                                formularioSeleccionado.adhesivo.descripcion }}
                        </p>
                        <p v-if="formularioSeleccionado.adhesivoExterno" class="text-body-1">
                            <strong>Adhesivo externo:</strong> {{ formularioSeleccionado.adhesivoExterno }}
                        </p>
                        <p class="text-body-1"><strong>Cantidad adhesivo:</strong> {{
                            formularioSeleccionado.kilosAdhesivo
                        }} kg</p>
                    </div>

                    <!-- Observaciones -->
                    <div class="detail-item">
                        <p class="text-body-1"><strong>Observaciones:</strong> {{ formularioSeleccionado.observaciones
                        }}
                        </p>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn prepend-icon="mdi-close-circle" color="error" variant="elevated" @click="abrirMotivo()">
                    Anular
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogMotivo" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">¿Está seguro de anular este formulario?</span>
            </v-card-title>
            <v-card-text>
                <v-textarea v-model="motivoRechazo" label="Motivo de anulación"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="dialogMotivo = false">
                    Cancelar
                </v-btn>
                <v-btn color="primary" variant="elevated" @click="rechazar()">
                    Anular
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog max-width="400px" v-model="loadingConfirmar" persistent>
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="d-flex justify-center">
                <span class="text-center">Generando preliquidación...</span>
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
        sortBy: [{ key: 'fechaCreacion', order: 'desc' }],
        headers: [
            { title: '', key: 'seleccionar', sortable: false },
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start' },
            { title: 'Folio', key: 'nroFolio', align: 'start' },
            // { title: 'Guía', key: 'guiaCsf', align: 'start' },
            { title: 'NV', key: 'nv', align: 'start' },
            { title: 'Código', key: 'codCsf', align: 'start' },
            { title: 'Nombre cliente', key: 'nombreCliente', align: 'start' },
            { title: 'Rut cliente', key: 'rutCliente', align: 'start' },
            { title: 'Total', key: 'cajasTotales', align: 'start' },
            { title: 'Buenas', key: 'cajasBuenas', align: 'start' },
            // { title: 'Mermas', key: 'mermasTotales', align: 'start' },
            { title: 'Prestador', key: 'lugarArmado.prestador.nombreCorto', align: 'start', sortable: false },
            { title: 'Lugar de armado', key: 'lugarArmado.nombre', align: 'start', sortable: false },
            { title: 'Temporada', key: 'temporada.nombre', align: 'start', sortable: false },
            { title: 'Fecha armado', key: 'fechaArmado', align: 'start' },
            { title: 'Fecha creación', key: 'fechaCreacion', align: 'start' },
            { title: 'Fecha aprobado prestador', key: 'fechaAprobado', align: 'start' },
            { title: 'Estado', key: 'estado', align: 'start' },
        ],
        headersSeleccionados: [
            { title: 'Folio', key: 'nroFolio' },
            { title: 'Cajas buenas', key: 'cajasBuenas' },
            // { title: 'Mermas totales', key: 'mermasTotales' },
            { title: 'Nombre cliente', key: 'nombreCliente', align: 'start' },
            { title: 'RUT cliente', key: 'rutCliente' },
            { title: 'Lugar de armado', key: 'lugarArmado.nombre' },
            { title: 'Fecha armado', key: 'fechaArmado' },
            { title: 'Fecha creación', key: 'fechaCreacion' },
            { title: 'Fecha aprobado prestador', key: 'fechaAprobado', align: 'start' },
            { title: 'Máquina', key: 'maquina.nmaquina' },
            { title: 'Adhesivo', key: 'adhesivo.codigo' },
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
        filtroEstado: [],
        selectedColumns: [],
        prestadores: [],
        filtroPrestador: null,
        allSelected: true,
        dialogDetalle: false,
        dialogConfirmar: false,
        loadingConfirmar: false,
        rangoFecha: ref([]),
        lugares: [],
        filtroLugar: null,
        temporadas: [],
        filtroTemporada: null,
        filtroCliente: null,
        dialogAnular: false,
        dialogMotivo: false,
        motivoRechazo: '',

    }),
    watch: {
        filtroEstado() {
            this.search = String(Date.now());
        },
        filtroPrestador() {
            this.search = String(Date.now());
            this.onPrestadorChange(this.filtroPrestador);
            this.allSelected = true;
        },
        rangoFecha() {
            this.search = String(Date.now());
        },
        filtroLugar() {
            this.search = String(Date.now());
        },
        filtroTemporada() {
            this.search = String(Date.now());
        },
        filtroCliente() {
            this.search = String(Date.now());
        },
        dialogMotivo(newVal){
            if(!newVal){
                this.motivoRechazo = '';
            }
        }
    },
    async mounted() {
        this.selectedColumns = [...this.serverItems];
        await this.obtenerTemporadas();
        await this.obtenerPrestadores();
        if (this.prestadores.length > 0 && this.serverItems.length > 0) {
            //setear filtroPrestrador pero solo si hay prestadores y formularios pero con el primero del serverItems
            this.filtroPrestador = this.serverItems[0].lugarArmado.prestador.id;
        }
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
    methods: {
        abrirDialogAnular(item) {
            this.dialogAnular = true;
            this.formularioSeleccionado = item;
            this.editedIndex = this.serverItems.indexOf(item);
        },
        async cambiarEstado(nuevoEstado) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/armados/cambiarEstado/${this.formularioSeleccionado.id}`, { estado: nuevoEstado, motivoRechazo: this.motivoRechazo }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.$notify({
                        text: 'Formulario anulado correctamente',
                        type: 'exito'
                    });
                    this.dialogAnular = false;
                    this.dialogMotivo = false;
                    this.motivoRechazo = '';
                    this.serverItems.splice(this.editedIndex, 1);
                }).catch((error) => {
                    console.error('Error al anular el formulario', error);
                    this.$notify({
                        text: 'Error al anular el formulario',
                        type: 'fallo'
                    });
                });

            } catch (error) {
                console.error('Error al anular el formulario', error);
                this.$notify({
                    text: 'Error al anular el formulario',
                    type: 'fallo'
                });
            }
        },
        abrirMotivo() {
            this.dialogMotivo = true;
        },
        rechazar() {
            this.cambiarEstado('anulado');
            this.dialogAnular = false;
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
        reniciarFecha() {
            this.rangoFecha = [];
        },
        abrirDetalle(item) {
            this.dialogDetalle = true;
            this.formularioSeleccionado = item;
        },
        toggleAllColumns() {
            this.serverItems.forEach(item => {
                if (item.estado === 'aprobado') {
                    item.selected = this.allSelected;
                }
            });
            this.updateSelectedColumns();
        },
        toggleColumn(item) {
            // Actualizar el estado de selected
            const index = this.selectedColumns.indexOf(item);
            if (index === -1) {
                this.selectedColumns.push(item);
            } else {
                this.selectedColumns.splice(index, 1);
            }
            // Actualizar el estado de allSelected
            this.allSelected = this.serverItems.every(item => item.selected || item.estado !== 'aprobado');
        },
        updateSelectedColumns() {
            // Sincronizar selectedColumns con los elementos seleccionados visualmente y cuyo estado es "aprobado"
            this.selectedColumns = this.serverItems.filter(item => item.selected && item.estado === 'aprobado');
        },
        abrirDialogConfirmar() {
            this.dialogConfirmar = true;
        },
        editarFormulario(item) {
            this.$router.push('/formularioAprobado/' + item.id);
        },
        async preliquidarFormularios() {
            try {
                this.loadingConfirmar = true;
                this.dialogConfirmar = false;
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const formularios = this.selectedColumns;
                await axios.post(`/liquidaciones/preliquidar`, { formularios }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }).then(() => {
                    this.$notify({
                        text: 'Formularios preliquidados correctamente',
                        type: 'exito'
                    });
                    //Eliminar formularios liquidados de la tabla
                    this.search = String(Date.now());
                    //Limpiar los formularios seleccionados
                    this.selectedColumns = [];
                    this.allSelected = true;
                    this.dialogConfirmar = false;
                }).catch((error) => {
                    console.error('Error al preliquidar los formularios', error);
                    this.$notify({
                        text: 'Error al preliquidar los formularios',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al preliquidar los formularios', error);
            } finally {
                this.loadingConfirmar = false;
            }
        },
        async loadItems({ page, itemsPerPage, sortBy } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let fechaInicio = this.rangoFecha[0];
                let fechaFin = this.rangoFecha[this.rangoFecha.length - 1];
                await axios.get(`/armados/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page,
                        sortBy,
                        estado: ['aprobado'],
                        prestadorId: this.filtroPrestador,
                        fechaInicio,
                        fechaFin,
                        lugarArmadoId: this.filtroLugar,
                        temporadaId: this.filtroTemporada,
                        rutCliente: this.filtroCliente,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.armados;
                    this.totalItems = response.data.total;
                    this.serverItems.forEach(item => {
                        item.selected = true;  // Todos seleccionados inicialmente
                    });
                    // Sincronizar selectedColumns con todos los elementos seleccionados
                    this.updateSelectedColumns();
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },
        async obtenerTemporadas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/temporadas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.temporadas = response.data;
                }).catch((error) => {
                    console.error('Error al cargar la temporadas', error);
                });
            } catch (error) {
                console.error(error);
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
                }).then((response) => {
                    this.prestadores = response.data;
                }).catch((error) => {
                    console.error('Error al cargar los prestadores', error);
                });
            } catch (error) {
                console.error(error);
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
        formatearDia(fecha) {
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