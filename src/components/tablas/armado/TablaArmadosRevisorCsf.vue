<template>
    <v-row style="margin-left: 5px; margin-top: 5px; margin-right: 5px;">
        <v-col cols="12" lg="3" md="4" sm="6">
            <v-select clearable prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Filtrar prestador"
                chips :items="prestadores" item-title="nombreCorto" item-value="id" @change="onPrestadorChange">
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                </template>
            </v-select>
        </v-col>

        <v-col cols="12" md="3" sm="3" v-if="lugares.length > 0">
            <v-select prepend-inner-icon="mdi-magnify" v-model="filtroLugar" label="Filtrar por lugar" chips clearable
                :items="lugares" item-title="nombre" item-value="id">
            </v-select>
        </v-col>
    </v-row>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        page-text="{0}-{1} de {2}" items-per-page-text="Formularios de armado por página"
        loading-text="Cargando, por favor espere" :items-per-page-options="[10, 25, 50, totalItems]">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Formularios de armado aprobados<v-icon
                        class="mx-2">mdi-form-select</v-icon></v-toolbar-title>
            </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editarFormulario(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Anular" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="red" @click="abrirDialogAprobar(item)">
                        mdi-file-cancel
                    </v-icon>
                </template>
            </v-tooltip>
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
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogAprobar" max-width="550px">
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
                        <p v-if="formularioSeleccionado.lugarArmado" class="text-body-1"><strong>Lugar de armado:</strong>
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
                        <p class="text-body-1"><strong>Máquina:</strong> {{ formularioSeleccionado.maquina.nmaquina }}
                        </p>
                        <p class="text-body-1"><strong>Adhesivo:</strong> {{ formularioSeleccionado.adhesivo.codigo }} -
                            {{
                                formularioSeleccionado.adhesivo.descripcion }}</p>
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
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Folio', key: 'nroFolio', align: 'start', sortable: false },
            { title: 'Guía', key: 'guiaCsf', align: 'start', sortable: false },
            { title: 'NV', key: 'nv', align: 'start', sortable: false },
            { title: 'Código', key: 'codCsf', align: 'start', sortable: false },
            { title: 'Rut cliente', key: 'rutCliente', align: 'start', sortable: false },
            { title: 'Total', key: 'cajasTotales', align: 'start', sortable: false },
            { title: 'Buenas', key: 'cajasBuenas', align: 'start', sortable: false },
            { title: 'Mermas', key: 'mermasTotales', align: 'start', sortable: false },
            { title: 'Prestador', key: 'lugarArmado.prestador.nombreCorto', align: 'start', sortable: false },
            { title: 'Lugar de armado', key: 'lugarArmado.nombre', align: 'start', sortable: false },
            { title: 'Temporada', key: 'temporada.nombre', align: 'start', sortable: false },
            { title: 'Fecha armado', key: 'fechaArmado', align: 'start', sortable: false },
            { title: 'Fecha creación', key: 'fechaCreacion', align: 'start', sortable: false },
            { title: 'Fecha aprobado', key: 'fechaAprobado', align: 'start', sortable: false },

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
        motivoRechazo: '',
        editedIndex: -1,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        dialogAprobar: false,
        dialogMotivo: false,
        prestadores: [],
        filtroPrestador: null,
        filtroLugar: null,
        lugares: [],
    }),
    watch: {
        filtroPrestador() {
            this.search = String(Date.now());
            this.onPrestadorChange(this.filtroPrestador);
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
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/armados/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        prestadorId: this.filtroPrestador,
                        lugarArmadoId: this.filtroLugar,
                        estado: ['aprobado'],
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
        editarFormulario(item) {
            this.$router.push('/formularioAprobado/' + item.id);
        },
        abrirDialogAprobar(item) {
            this.dialogAprobar = true;
            this.formularioSeleccionado = item;
            this.editedIndex = this.serverItems.indexOf(item);
        },
        async cambiarEstado(nuevoEstado) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/armados/preliquidar/${this.formularioSeleccionado.id}`, { estado: nuevoEstado, motivoRechazo: this.motivoRechazo }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.$notify({
                        text: 'Formulario rechazado correctamente',
                        type: 'warning'
                    });
                    this.dialogAprobar = false;
                    this.dialogMotivo = false;
                    this.serverItems.splice(this.editedIndex, 1);
                }).catch((error) => {
                    console.error('Error al aprobar el formulario', error);
                    this.$notify({
                        text: 'Error al aprobar el formulario',
                        type: 'fallo'
                    });
                });

            } catch (error) {
                console.error('Error al aprobar el formulario', error);
                this.$notify({
                    text: 'Error al aprobar el formulario',
                    type: 'fallo'
                });
            }
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
        abrirMotivo() {
            this.dialogMotivo = true;
        },
        rechazar() {
            this.cambiarEstado('rechazado');
            this.dialogAprobar = false;
        }
    }
};
</script>

<style></style>