<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-row style="margin-left: 5px; margin-top: 5px;">
        <v-col cols="12" md="3" sm="6">
            <v-select chips clearable prepend-inner-icon="mdi-calendar-clock" v-model="filtroTemporada"
                :items="temporadas" item-title="nombre" item-value="id" label="Temporada">
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                        :subtitle="'ID:' + item.raw.id + ' Rango: ' + formatearDia(item.raw.inicio) + ' - ' + formatearDia(item.raw.fin)"></v-list-item>
                </template>
            </v-select>
        </v-col>

    </v-row>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Folios por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Folios de prestador ({{ this.$route.params.id }}) {{
                    this.$route.params.nombre }}<v-icon class="mx-2">mdi-ticket</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nuevo folio
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-select prepend-inner-icon="mdi-ticket-confirmation" label="Seleccione rango"
                                            :items="rangos" v-model="selectedRango"></v-select>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-number-input prepend-inner-icon="mdi-book-multiple" v-model="talonarios"
                                            :max="50000000" :min="1" label="Talonarios"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-number-input prepend-inner-icon="mdi-counter" v-model="editedItem.inicio"
                                            :max="50000000" :min="1" label="Inicio"
                                            :step="selectedRango"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-calendar-clock"
                                            v-model="editedItem.temporadaId" :items="temporadas" item-title="nombre"
                                            item-value="id" label="Temporada">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'ID:' + item.raw.id + ' Rango: ' + formatearDia(item.raw.inicio) + ' - ' + formatearDia(item.raw.fin)"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="close">
                                Cancelar
                            </v-btn>
                            <v-btn color="primary" variant="elevated" @click="save">
                                Guardar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            <span class="text-h6 text-wrap">
                                ¿Estás seguro que deseas eliminar estos folios?
                            </span>
                            <span span class="text-h6 text-wrap">
                                Folios entre {{ editedItem.inicio }} y {{ editedItem.fin }} de la temporada
                                {{ editedItem.temporada.nombre }}.
                            </span>
                        </v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeDelete">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="deleteItemConfirm">Si, eliminar</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-toolbar>
        </template>
        <template v-slot:[`item.creado`]="{ item }">
            <span>{{ formatearFecha(item.creado) }}</span>
        </template>
        <template v-slot:[`item.foliosNulos`]="{ item }">
            <span>{{ item.foliosNulos.length }}</span>
        </template>
        <template v-slot:[`item.disponibles`]="{ item }">
            <span>{{ (item.fin - item.inicio) - item.consumidos - item.foliosNulos.length + 1 }}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editItem(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Anular folios" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="anularFolios(item)">
                        mdi-file-cancel
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="item.foliosNulos.length > 0" text="Cancelar folios nulos" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="cancelarFoliosNulos(item)">
                        mdi-marker-cancel
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Eliminar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="deleteItem(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
    <v-dialog v-model="dialogAnular" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                <span class="text-h6 text-wrap">
                    Anular folio entre {{ editedItem.inicio }} y {{ editedItem.fin }} de la temporada
                    {{ editedItem.temporada.nombre }}.
                </span>
            </v-card-title>
            <!-- Mostrar folios ya anulados -->
            <v-card-text v-if="editedItem.foliosNulos.length > 0">
                <v-row justify="center">
                    <span>
                        Folios anulados: {{editedItem.foliosNulos.map(folio => folio.nroFolio).join(', ')}}
                    </span>
                </v-row>
            </v-card-text>

            <v-card-text>
                <v-row justify="center">
                    <v-col cols="8" md="8" sm="10">
                        <v-number-input rounded="xl" v-model="nroFolio" :reverse="false" :min="editedItem.inicio"
                            :max="editedItem.fin" controlVariant="split" label="Número de folio" :hideInput="false"
                            inset variant="solo-filled"></v-number-input>
                    </v-col>
                </v-row>
                <!-- Motivo -->
                <v-row justify="center">
                    <v-col cols="8" md="8" sm="10">
                        <v-textarea v-model="motivoAnulacion" label="Motivo" rows="3"></v-textarea>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="closeAnular">Cancelar</v-btn>
                <v-btn color="primary" variant="elevated" @click="confirmarAnularFolio">Si, anular</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogCancelarAnulacion" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                <span class="text-h6 text-wrap">
                    Folios anulados entre {{ editedItem.inicio }} y {{ editedItem.fin }} de la temporada
                    {{ editedItem.temporada.nombre }}.
                </span>
            </v-card-title>
            <v-card-text>
                <v-row justify="center">
                    <v-col cols="12" md="10" sm="10">
                        <v-container>
                            <v-chip v-for="(folio) in editedItem.foliosNulos" :key="folio.nroFolio"
                                style="margin: 5px;">
                                {{ folio.nroFolio }}
                                <v-icon color="red" class="ml-2" size="20" @click="cancelarFolioNulo(folio.nroFolio)">
                                    mdi-delete
                                </v-icon>
                            </v-chip>
                        </v-container>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="dialogCancelarAnulacion = false">Cerrar</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="dialogConfirmarAnulacion" max-width="550px">
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title class="text-center d-flex flex-column">
                <span class="text-h6 text-wrap">
                    ¿Estás seguro que deseas cancelar la anulación del folio {{ folioAnular }}?
                </span>
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="elevated" @click="dialogConfirmarAnulacion = false">Cancelar</v-btn>
                <v-btn color="primary" variant="elevated" @click="confirmarCancelarAnulacion">Si, cancelar</v-btn>
                <v-spacer></v-spacer>
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
            { title: 'Inicio', key: 'inicio', align: 'start', sortable: false },
            { title: 'Fin', key: 'fin', align: 'start', sortable: false },
            { title: 'Consumidos', key: 'consumidos', align: 'start', sortable: false },
            { title: 'Disponibles', key: 'disponibles', align: 'start', sortable: false },
            { title: 'Temporada nombre', key: 'temporada.nombre', align: 'start', sortable: false },
            { title: 'Folios nulos', key: 'foliosNulos', align: 'start', sortable: false },
            { title: 'Fecha creación', key: 'creado', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            inicio: 0,
            fin: 0,
            temporadaId: null,
            temporada: {
                nombre: '',
            },
            creado: ''
        },
        defaultItem: {
            inicio: 0,
            fin: 0,
            temporadaId: null,
            temporada: {
                nombre: '',
            },
            creado: ''
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        dialogAnular: false,
        dialogCancelarAnulacion: false,
        dialogConfirmarAnulacion: false,
        folioAnular: null,
        rangos: [30],
        selectedRango: 30,
        temporadas: [],
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        items: [
            {
                title: 'Prestadores',
                disabled: false,
                href: '/prestadores',
            },
            {
                title: `Folios`,
                disabled: true,
                href: '',
            },
        ],
        talonarios: 0,
        filtroTemporada: null,
        nroFolio: null,
        motivoAnulacion: ''
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo folio' : 'Editar folio'
        },
    },
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
        filtroTemporada() {
            this.search = String(Date.now());
        }
    },
    async created() {
        await this.obtenerTemporadas();
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/folios/prestador`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        prestadorId: this.$route.params.id,
                        temporadaId: this.filtroTemporada
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.folios;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar los folios', error);
                });
            } catch (error) {
                console.error('Error al cargar los folios', error);
            } finally {
                this.loading = false;
            }
        },
        cancelarFolioNulo(numero) {
            this.folioAnular = numero;
            this.dialogConfirmarAnulacion = true;
        },
        async confirmarCancelarAnulacion() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/folio-nulo/${this.folioAnular}/${this.editedItem.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.$notify({
                        text: `Anulación de folio ${response.data.nroFolio} cancelada correctamente`,
                        type: 'exito'
                    });
                    this.serverItems[this.editedIndex].foliosNulos = this.editedItem.foliosNulos.filter(folio => folio.nroFolio !== this.folioAnular);
                    this.dialogConfirmarAnulacion = false;
                    this.dialogCancelarAnulacion = false;
                }).catch((error) => {
                    console.error('Error al cancelar anulación de folio', error);
                });
            } catch (error) {
                console.error('Error al cancelar anulación de folio', error);
            }
        },
        async confirmarAnularFolio() {
            try {
                // Verificar que ya no esté anulado
                if (this.editedItem.foliosNulos.some(folio => folio.nroFolio === this.nroFolio)) {
                    this.$notify({
                        text: `Folio ${this.nroFolio} ya se encuentra anulado`,
                        type: 'fallo'
                    });
                    return;
                }
                if (this.nroFolio === null) {
                    this.$notify({
                        text: 'Ingrese un número de folio',
                        type: 'fallo'
                    });
                    return;
                }
                if (this.motivoAnulacion === '') {
                    this.$notify({
                        text: 'Ingrese un motivo de anulación',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/folio-nulo`, {
                    nroFolio: this.nroFolio, folioId: this.editedItem.id,
                    motivo: this.motivoAnulacion
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 404) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return;
                    }
                    this.$notify({
                        text: `Folio ${response.data.nroFolio} anulado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems[this.editedIndex].foliosNulos.push(response.data);
                    this.closeAnular();
                }).catch((error) => {
                    console.error('Error al anular folio', error);
                });
            } catch (error) {
                console.error('Error al anular folio', error);
            }
        },
        closeAnular() {
            this.dialogAnular = false;
            this.$nextTick(() => {
                this.nroFolio = null;
                this.motivoAnulacion = '';
            });
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
        formatearDia(fecha) {
            const date = new Date(fecha);
            return date.toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false
            });
        },
        editItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        anularFolios(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogAnular = true
        },
        cancelarFoliosNulos(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogCancelarAnulacion = true
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            await this.eliminarFolio();
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeDelete() {
            this.dialogDelete = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        async save() {
            //validar folio aqui
            if (this.editedIndex > -1) {
                await this.actualizarFolio();
            } else {
                await this.nuevosFolios();
            }
        },
        validarInicio(inicio, rango) {
            if (inicio >= 1 && (inicio - 1) % rango === 0) {
                return true;
            }
            return false;
        },
        async nuevosFolios() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                if (this.editedItem.temporadaId === null) {
                    this.$notify({
                        text: 'Seleccione una temporada',
                        type: 'fallo'
                    });
                    return;
                }
                if (!this.validarInicio(this.editedItem.inicio, this.selectedRango)) {
                    this.$notify({
                        text: `El inicio debe ser un múltiplo de ${this.selectedRango} + 1`,
                        type: 'fallo'
                    });
                    return;
                }
                this.editedItem.prestadorId = parseInt(this.$route.params.id);
                //separar selectedFolios en inicio y fin
                this.editedItem.fin = this.editedItem.inicio + this.selectedRango - 1;
                const nuevosFolios = {
                    inicio: this.editedItem.inicio,
                    rango: this.selectedRango,
                    talonarios: this.talonarios,
                    prestadorId: this.editedItem.prestadorId,
                    temporadaId: this.editedItem.temporadaId
                };
                await axios.post(`/folios`, nuevosFolios, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 404 || response.data.status === 409) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        console.log('fallo en error')
                    }
                    else {
                        this.search = String(Date.now());
                        this.$notify({
                            text: `Folios creados correctamente`,
                            type: 'exito'
                        });
                    }
                    this.close();
                }).catch((error) => {
                    if (error.response.status === 409) {
                        this.$notify({
                            text: error.response.data.message,
                            type: 'fallo'
                        });
                    }
                    else {
                        console.error('Error al crear nuevos folios', error);
                        this.$notify({
                            text: 'Error al crear folios',
                            type: 'fallo'
                        });
                    }

                });
            } catch (error) {
                console.error('Error al crear nuevos folios', error);
            }
        },
        async eliminarFolio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/folios/${this.editedItem.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.$notify({
                        text: `Folios ${response.data.id} eliminados correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;
                    this.closeDelete()

                }).catch((error) => {
                    console.error('Error al eliminar folios', error);
                    this.$notify({
                        text: 'Error al eliminar folios',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar folios', error);
            }
        },
        async actualizarFolio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                this.editedItem.fin = this.editedItem.inicio + this.selectedRango - 1;
                const folioActualizado = {
                    inicio: this.editedItem.inicio,
                    fin: this.editedItem.fin,
                    prestadorId: this.editedItem.prestadorId,
                    temporadaId: this.editedItem.temporadaId
                };
                await axios.patch(`/folios/${this.editedItem.id}`, folioActualizado, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404) {
                        this.$notify({
                            text: `Folios ${this.editedItem.id} actualizados correctamente`,
                            type: 'exito'
                        });
                    }
                    else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        return;
                    }
                    this.editedItem.temporada = this.temporadas.find(temporada => temporada.id === this.editedItem.temporadaId);
                    Object.assign(this.serverItems[this.editedIndex], this.editedItem)
                    this.close()
                }).catch((error) => {
                    console.error('Error al actualizar folios', error);
                    this.$notify({
                        text: 'Error al actualizar folios',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar folios', error);
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
                    console.error('Error al cargar las temporadas', error);
                });
            } catch (error) {
                console.error('Error al cargar las temporadas', error);
            }
        }
    }
};
</script>

<style></style>