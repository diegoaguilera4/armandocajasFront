<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-data-table :headers="headers" :items="adhesivosLugar" items-per-page-text="Adhesivos por página"
        page-text="{0}-{1} de {2}">
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
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-water" v-model="adhesivoSeleccionado"
                                            :items="adhesivosSelect" item-title="adhesivo.descripcion"
                                            item-value="adhesivo.id" label="Descripción">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'Código: ' + item.raw.adhesivo.codigo + ' - Descripcion 2: ' + item.raw.adhesivo.descripcion2 + ' - Disponible: ' + item.raw.kilosNoAsignados + 'kg'">
                                                </v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" md="5" sm="5">
                                        <v-text-field v-model="kilosDispo" readonly
                                            label="Stock disponible (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="7" sm="7">
                                        <v-number-input v-model="editedItem.kilosEntregados" :step=".1"
                                            control-variant="split" :max="parseFloat(kilosDispo)" :min="0"
                                            label="Ingrese cantidad (kg)"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field v-model="guiaDespacho"
                                            label="Guía de despacho (opcional)"></v-text-field>
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
                <v-dialog v-model="dialogAgregar" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            Agregar adhesivo
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="12" sm="12">
                                        {{ adhesivoAgregar.adhesivo.codigo }} - {{ adhesivoAgregar.adhesivo.descripcion
                                        }}
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="adhesivoAgregar.kilosNoAsignados" readonly
                                            label="Cantidad disponible (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosDisponibles" readonly
                                            label="Cantidad disponible (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-number-input v-model="kilosAgregar" :step=".1" control-variant="split"
                                            :max="parseFloat(this.adhesivoAgregar.kilosNoAsignados)" :min="0"
                                            label="Ingrese cantidad (kg)"></v-number-input>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field v-model="guiaDespacho"
                                            label="Guía de despacho (opcional)"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeAgregar">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="agregarAdhesivo">Agregar</v-btn>
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
                                    <v-col cols="12" md="12" sm="12">
                                        {{ adhesivoAgregar.adhesivo.codigo }} - {{ adhesivoAgregar.adhesivo.descripcion
                                        }}
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosDisponibles" readonly
                                            label="Cantidad disponible (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="6" sm="6">
                                        <v-text-field v-model="editedItem.kilosUsados" readonly
                                            label="Cantidad usada (kg)"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-number-input v-model="kilosAgregar" :step=".1" control-variant="split"
                                            :max="parseFloat(editedItem.kilosDisponibles)" :min="0"
                                            label="Ingrese cantidad (kg)"></v-number-input>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeQuitar">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="quitarAdhesivo">Quitar</v-btn>
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
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="abrirAgregar(item)">
                        mdi-water-plus
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Quitar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#FFA726" @click="abrirQuitar(item)">
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
        dialogAgregar: false,
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
                title: 'Kilos usados',
                align: 'start',
                sortable: false,
                key: 'kilosUsados',
            },
        ],
        adhesivosLugar: [],
        adhesivos: [],
        adhesivosSelect: [],
        editedIndex: -1,
        sumaKilos: null,
        kilosAgregar: null,
        editedItem: {
            adhesivoId: null,
            kilosEntregados: null,
            kilosUsados: null,
            adhesivo: {
                codigo: null,
                descripcion: null,
                descripcion2: null,
            },
        },
        defaultItem: {
            adhesivoId: null,
            kilosEntregados: null,
            kilosUsados: null,
            adhesivo: {
                codigo: null,
                descripcion: null,
                descripcion2: null,
            },
        },
        items: [
            {
                title: 'Lugares de armado',
                disabled: false,
                href: '/lugaresPrestador',
            },
            {
                title: `Adhesivos`,
                disabled: true,
                href: '',
            },
        ],
        adhesivoSeleccionado: null,
        kilosDispo: null,
        adhesivoAgregar: null,
        guiaDespacho: '',
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Añadir adhesivo' : 'Agregar adhesivo'
        },
    },

    watch: {
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
        dialogAgregar(val) {
            val || this.closeAgregar()
        },
        dialogQuitar(val) {
            val || this.closeQuitar()
        },
        adhesivoSeleccionado(val) {
            //obtener adhesivo de ese id
            if (val) {
                let adhesivo = this.adhesivos.find(adhesivo => adhesivo.adhesivoId === val)
                this.kilosDispo = adhesivo.kilosNoAsignados
            }
        },
    },
    async created() {
        await this.obtenerAdhesivosLugar()
        await this.obtenerAdhesivosDisponibles()
    },
    methods: {
        async obtenerAdhesivosLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/adhesivosLugar/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                        this.adhesivosLugar = response.data;
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
                const user = JSON.parse(localStorage.getItem('user'));
                await axios.get(`adhesivosLugar/stock/${user.prestador[0].prestadorId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivos = response.data;
                    //Guardar en adhesivosSelect los adhesivos que no estan en la lista de adhesivosLugar, comparando adhesivoId
                    this.adhesivosSelect = this.adhesivos.filter(adhesivo => !this.adhesivosLugar.some(adhesivoLugar => adhesivoLugar.adhesivoId === adhesivo.adhesivoId))
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
        deleteItem(item) {
            this.editedIndex = this.adhesivosLugar.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        abrirAgregar(item) {
            this.editedIndex = this.adhesivosLugar.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogAgregar = true
            this.adhesivoAgregar = this.adhesivos.find(adhesivo => adhesivo.adhesivoId === item.adhesivoId)
        },
        abrirQuitar(item) {
            this.editedIndex = this.adhesivosLugar.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.adhesivoAgregar = this.adhesivos.find(adhesivo => adhesivo.adhesivoId === item.adhesivoId)
            this.dialogQuitar = true
        },
        async deleteItemConfirm() {
            await this.eliminarAdhesivo()
            await this.obtenerAdhesivosDisponibles()
            this.closeDelete()
        },
        close() {
            this.dialog = false
            this.sumaKilos = null;
            this.adhesivoSeleccionado = null;
            this.kilosDispo = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeAgregar() {
            this.dialogAgregar = false
            this.kilosAgregar = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeDelete() {
            this.dialogDelete = false
            this.adhesivoSeleccionado = null;
            this.kilosDispo = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeQuitar() {
            this.dialogQuitar = false
            this.kilosAgregar = null;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        async añadirAdhesivo() {
            try {
                if (!this.verificarFloat(this.editedItem.kilosEntregados, this.kilosDispo)) {
                    this.$notify({
                        text: 'Ingrese un valor válido',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const nuevoAdhesivoLugar = {
                    adhesivoId: this.adhesivoSeleccionado,
                    lugarArmadoId: parseInt(this.$route.params.id),
                    kilosDisponibles: parseFloat(this.editedItem.kilosEntregados),
                    kilosAsignados: parseFloat(this.editedItem.kilosEntregados),
                    kilosUsados: 0,
                }
                await axios.post(`/adhesivosLugar`, { adhesivo: nuevoAdhesivoLugar, guiaDespacho: this.guiaDespacho }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    //Verificar si existe el adhesivo en la lista
                    //Si existe, sumar los kilos
                    let index = this.adhesivosLugar.findIndex(adhesivo => adhesivo.adhesivoId === response.data.adhesivoId)
                    if (index !== -1) {
                        this.adhesivosLugar[index].kilosEntregados += nuevoAdhesivoLugar.kilosEntregados
                    } else {
                        this.adhesivosLugar.push(response.data)
                    }
                    this.guiaDespacho = '';
                    //Obtener nuevamente stock disponible
                    this.obtenerAdhesivosDisponibles()
                    this.close()
                    this.$notify({
                        text: `Adhesivo ${response.data.adhesivo.codigo} agregado correctamente`,
                        type: 'exito'
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
        async agregarAdhesivo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                if (!this.verificarFloat(this.kilosAgregar, this.adhesivoAgregar.kilosNoAsignados)) {
                    this.$notify({
                        text: 'Ingrese un valor válido',
                        type: 'fallo'
                    });
                    return;
                }
                const adhesivoLugarActualizado = {
                    kilosDisponibles: parseFloat(this.kilosAgregar),
                };
                await axios.patch(`/adhesivosLugar/${this.editedItem.adhesivoId}/${this.$route.params.id}`, { adhesivo: adhesivoLugarActualizado, guiaDespacho: this.guiaDespacho }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivosLugar[this.editedIndex] = response.data;
                    this.guiaDespacho = '';
                    this.obtenerAdhesivosDisponibles()
                    this.closeAgregar()
                    this.$notify({
                        text: `Adhesivo ${response.data.adhesivo.codigo} actualizado correctamente`,
                        type: 'exito'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al agregar el adhesivo',
                    type: 'fallo'
                });
            }
        },
        async quitarAdhesivo() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                if (!this.verificarFloat(this.kilosAgregar, this.adhesivoAgregar.kilosDisponibles)) {
                    this.$notify({
                        text: 'Ingrese un valor válido',
                        type: 'fallo'
                    });
                    return;
                }
                const adhesivoLugarActualizado = {
                    kilosDisponibles: -parseFloat(this.kilosAgregar),
                };
                await axios.patch(`/adhesivosLugar/${this.editedItem.adhesivoId}/${this.$route.params.id}`, { adhesivo: adhesivoLugarActualizado, guiaDespacho: this.guiaDespacho }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivosLugar[this.editedIndex] = response.data;
                    this.obtenerAdhesivosDisponibles()
                    this.closeQuitar()
                    this.$notify({
                        text: `Adhesivo ${response.data.adhesivo.codigo} actualizado correctamente`,
                        type: 'exito'
                    });
                })
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al quitar el adhesivo',
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
                await axios.delete(`/adhesivosLugar/${this.editedItem.adhesivoId}/${this.$route.params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(response => {
                    this.adhesivosLugar.splice(this.editedIndex, 1)
                    this.$notify({
                        text: `Adhesivo ${response.data.adhesivo.codigo} eliminado correctamente`,
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
        verificarFloat(value, maximo) {
            // Verifica si el valor es un número flotante válido
            return !isNaN(value) && parseFloat(value) == value && parseFloat(value) <= parseFloat(maximo) && parseFloat(value) > 0;
        },
        async save() {
            if (this.editedIndex > -1) {
                await this.actualizarAdhesivo();
            } else {
                await this.añadirAdhesivo();
            }

        },
    },
}
</script>