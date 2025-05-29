<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-data-table :headers="headers" :items="adhesivosPrestador" items-per-page-text="Adhesivos por página"
        page-text="{0}-{1} de {2}">
        <template v-slot:[`item.precio`]="{ item }">
            <span>${{ item.precio }} CLP</span>
        </template>
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Adhesivos de {{
                    this.$route.params.nombre }}<v-icon class="mx-2">mdi-water</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-water-plus" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Añadir adhesivo
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="12" sm="12">
                                        {{ editedItem.adhesivo.codigo }} - {{ editedItem.adhesivo.descripcion
                                        }}
                                    </v-col>
                                    <v-col v-if="editedIndex === -1" cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-water" v-model="editedItem.adhesivoId"
                                            :items="adhesivos" item-title="descripcion" label="Descripción"
                                            item-value="id">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'Código: ' + item.raw.codigo + ' - Descripcion 2: ' + item.raw.descripcion2"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col v-if="editedIndex === -1" cols="12" md="12" sm="12">
                                        <v-number-input v-model="editedItem.kilosEntregados" :step=".1"
                                            control-variant="split" :min="0"
                                            label="Ingrese cantidad (kg)"></v-number-input>
                                    </v-col>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosAsignados" readonly
                                            label="Adhesivo asignado (kg)"></v-text-field>
                                    </v-col>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosDisponibles" readonly
                                            label="Adhesivo disponible (kg)"></v-text-field>
                                    </v-col>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosNoAsignados" readonly
                                            label="No asignado (kg)"></v-text-field>
                                    </v-col>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="12" sm="12">
                                        <v-number-input v-model="sumaKilos" :step=".1" control-variant="split" :min="0"
                                            label="Ingrese cantidad (kg)"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field v-model="guiaDespacho" label="Guía de despacho"
                                            :rules="[rules.required]"></v-text-field>
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
                <v-dialog v-model="dialogQuitar" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            Quitar adhesivo
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col v-if="editedIndex !== -1" cols="12" md="12" sm="12">
                                        {{ editedItem.adhesivo.codigo }} - {{ editedItem.adhesivo.descripcion
                                        }}
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosDisponibles" readonly
                                            label="Adhesivo disponible (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosNoAsignados" readonly
                                            label="Adhesivo no asignado (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-number-input v-model="sumaKilos" :step=".1" control-variant="split" :min="0"
                                            :max="posibleBorrar" label="Ingrese cantidad (kg)"></v-number-input>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeQuitar">
                                Cancelar
                            </v-btn>
                            <v-btn color="primary" variant="elevated" @click="quitarAdhesivo">
                                Quitar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            <span class="text-h6 text-wrap">
                                ¿Estás seguro que deseas eliminar este adhesivo?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{ editedItem.adhesivo.codigo }} - {{ editedItem.adhesivo.descripcion }}
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
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip text="Agregar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editItem(item)">
                        mdi-water-plus
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="item.kilos !== item.kilosUsados" text="Quitar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#FFA726" @click="quitarAdh(item)">
                        mdi-water-minus
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
    </v-data-table>
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        dialog: false,
        dialogDelete: false,
        dialogQuitar: false,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            {
                title: 'Código',
                align: 'start',
                sortable: false,
                key: 'adhesivo.codigo',
            },
            {
                title: 'Descripcion',
                align: 'start',
                sortable: false,
                key: 'adhesivo.descripcion',
            },
            {
                title: 'Descripcion 2',
                align: 'start',
                sortable: false,
                key: 'adhesivo.descripcion2',
            },
            {
                title: 'Kilos disponibles',
                align: 'start',
                sortable: false,
                key: 'kilosDisponibles',
            },
            {
                title: 'Kilos no asignados',
                align: 'start',
                sortable: false,
                key: 'kilosNoAsignados',
            },
            {
                title: 'Kilos usados',
                align: 'start',
                sortable: false,
                key: 'kilosUsados',
            },
        ],
        adhesivosPrestador: [],
        adhesivos: [],
        editedIndex: -1,
        sumaKilos: null,
        editedItem: {
            adhesivoId: null,
            kilosEntregados: null,
            adhesivo: {
                codigo: null,
                descripcion: null,
                descripcion2: null,
            },
        },
        defaultItem: {
            adhesivoId: null,
            kilos: null,
            adhesivo: {
                codigo: null,
                descripcion: null,
                descripcion2: null,
            },
        },
        items: [
            {
                title: 'Prestadores',
                disabled: false,
                href: '/prestadores',
            },
            {
                title: `Adhesivos`,
                disabled: true,
                href: '',
            },
        ],
        guiaDespacho: '',
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Añadir adhesivo' : 'Agregar adhesivo'
        },
        posibleBorrar() {
            return parseFloat(this.editedItem.kilosEntregados) - parseFloat(this.editedItem.kilosAsignados);
        }
    },
    watch: {
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
        dialogQuitar(val) {
            val || this.closeQuitar()
        },
    },
    async created() {
        await this.obtenerAdhesivosPrestador()
        await this.obtenerAdhesivosDisponibles()
    },
    methods: {
        async obtenerAdhesivosPrestador() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivosPrestador/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivosPrestador = response.data;
                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al obtener los adhesivos',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al obtener los adhesivos',
                    type: 'fallo'
                });
            }
        },
        async obtenerAdhesivosDisponibles() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`adhesivosPrestador/disponibles/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivos = response.data;
                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al obtener los servicios',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al obtener los servicios',
                    type: 'fallo'
                });
            }
        },
        editItem(item) {
            this.editedIndex = this.adhesivosPrestador.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        quitarAdh(item) {
            this.editedIndex = this.adhesivosPrestador.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogQuitar = true
        },
        deleteItem(item) {
            this.editedIndex = this.adhesivosPrestador.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            await this.eliminarAdhesivo()
            await this.obtenerAdhesivosDisponibles()
            this.closeDelete()
        },
        close() {
            this.dialog = false
            this.sumaKilos = null;
            this.guiaDespacho = '';
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
        closeQuitar() {
            this.dialogQuitar = false
            this.sumaKilos = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        async añadirAdhesivo() {
            try {
                if (!this.verificarFloatSumar(this.editedItem.kilosEntregados)) {
                    this.$notify({
                        text: 'Ingrese un valor válido',
                        type: 'fallo'
                    });
                    return;
                }
                if (this.editedItem.adhesivoId === null) {
                    this.$notify({
                        text: 'Seleccione un adhesivo',
                        type: 'fallo'
                    });
                    return;
                }
                if (this.guiaDespacho.trim() === '') {
                    this.$notify({
                        text: 'Ingrese una guía de despacho',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const adhesivoNuevo = {
                    adhesivoId: parseInt(this.editedItem.adhesivoId),
                    kilosEntregados: (this.editedItem.kilosEntregados),
                    kilosNoAsignados: (this.editedItem.kilosEntregados),
                    kilosAsignados: 0,
                    kilosDisponibles: 0,
                    kilosUsados: 0,
                    prestadorId: parseInt(this.$route.params.id),
                }
                await axios.post(`/adhesivosPrestador`, { adhesivo: adhesivoNuevo, guiaDespacho: this.guiaDespacho }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    if (response.data.status !== 404) {
                        this.adhesivosPrestador.push(response.data);
                        this.guiaDespacho = '';
                        this.close();
                        this.$notify({
                            text: 'Adhesivo agregado correctamente',
                            type: 'exito'
                        });
                    }
                    else {
                        this.$notify({
                            text: 'Error al agregar el adhesivo',
                            type: 'fallo'
                        });
                    }

                }).catch(error => {
                    console.error(error)
                    this.$notify({
                        text: 'Error al agregar el adhesivo',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error)
                this.$notify({
                    text: 'Error al agregar el adhesivo',
                    type: 'fallo'
                });
            }
        },
        async eliminarAdhesivo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/adhesivosPrestador/${this.editedItem.adhesivoId}/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivosPrestador.splice(this.editedIndex, 1)
                    this.$notify({
                        text: `Adhesivo ${response.data.adhesivoId} eliminado correctamente`,
                        type: 'exito'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al eliminar el Adhesivo',
                    type: 'fallo'
                });
            }
        },
        verificarFloatSumar(value) {
            // Verifica si el valor es un número flotante válido
            return !isNaN(value) && parseFloat(value) == value && parseFloat(value) > 0;
        },
        verificarFloatRestar(value) {
            // Verifica si el valor es un número flotante válido
            return !isNaN(value) && parseFloat(value) == value && parseFloat(value) > 0 && parseFloat(value) <= this.posibleBorrar;
        },
        async agregarAdhesivo() {
            try {
                if (!this.verificarFloatSumar(this.sumaKilos)) {
                    this.$notify({
                        text: 'Ingrese un valor válido y mayor a 0',
                        type: 'fallo'
                    });
                    return;
                }
                if (this.guiaDespacho.trim() === '') {
                    this.$notify({
                        text: 'Ingrese una guía de despacho',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const adhesivoActualizado = {
                    adhesivoId: parseInt(this.editedItem.adhesivoId),
                    kilosEntregados: parseFloat(this.sumaKilos),
                    prestadorId: parseInt(this.$route.params.id)
                }
                await axios.patch(`/adhesivosPrestador/${this.editedItem.adhesivoId}/${this.$route.params.id}`, { adhesivo: adhesivoActualizado, guiaDespacho: this.guiaDespacho }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    Object.assign(this.adhesivosPrestador[this.editedIndex], response.data)
                    this.sumaKilos = null;
                    this.guiaDespacho = '';
                    this.close();
                    this.$notify({
                        text: 'Adhesivo agregado correctamente',
                        type: 'exito'
                    });
                }).catch(error => {
                    console.error(error)
                    this.$notify({
                        text: 'Error al agregar adhesivo',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error)
                this.$notify({
                    text: 'Error al agregar adhesivo',
                    type: 'fallo'
                });
            }
        },
        async quitarAdhesivo() {
            try {
                if (!this.verificarFloatRestar(this.sumaKilos)) {
                    this.$notify({
                        text: 'Ingrese un valor válido y mayor a 0',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const adhesivoActualizado = {
                    adhesivoId: parseInt(this.editedItem.adhesivoId),
                    kilosEntregados: -parseFloat(this.sumaKilos),
                    prestadorId: parseInt(this.$route.params.id)
                }
                await axios.patch(`/adhesivosPrestador/${this.editedItem.adhesivoId}/${this.$route.params.id}`, { adhesivo: adhesivoActualizado }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    Object.assign(this.adhesivosPrestador[this.editedIndex], response.data)
                    this.sumaKilos = null;
                    this.closeQuitar();
                    this.$notify({
                        text: 'Adhesivo quitado correctamente',
                        type: 'exito'
                    });
                }).catch(error => {
                    console.error(error)
                    this.$notify({
                        text: 'Error al quitar adhesivo',
                        type: 'fallo'
                    });
                })
            } catch (error) {
                console.error(error)
                this.$notify({
                    text: 'Error al quitar adhesivo',
                    type: 'fallo'
                });
            }
        },
        async save() {
            if (this.editedIndex > -1) {
                await this.agregarAdhesivo();
            } else {
                await this.añadirAdhesivo();
                await this.obtenerAdhesivosDisponibles();
            }

        },
    },
}
</script>