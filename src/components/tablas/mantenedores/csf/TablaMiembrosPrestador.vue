<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading" :search="search"
        item-value="_id" @update:options="loadItems" page-text="{0}-{1} de {2}"
        items-per-page-text="Miembros por página" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Miembros de {{ this.$route.params.nombre }}<v-icon
                        class="mx-2">mdi-account-group</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-account-multiple-plus" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nuevo miembro
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
                                        <v-autocomplete prepend-inner-icon="mdi-account" v-model="editedItem.id"
                                            :items="usuariosDisponibles" item-title="nombre" item-value="id"
                                            label="Usuario">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'ID:' + item.raw.id + ' - Correo:' + item.raw.correo + ' - Rol:' + item.raw.rol"></v-list-item>
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
                <v-dialog v-model="dialogLugar" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">Lugar de armado</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-package-variant"
                                            v-model="editedItem.lugar" :items="lugaresArmado" item-title="nombre"
                                            item-value="id" label="Seleccione lugar de armado">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'ID:' + item.raw.id"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeLugar">
                                Cancelar
                            </v-btn>
                            <v-btn color="primary" variant="elevated" @click="saveLugar">
                                Guardar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogDelete" max-width="550px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title class="text-center d-flex flex-column">
                            <span class="text-h6 text-wrap">
                                ¿Estás seguro que deseas quitar este miembro?
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
            <v-tooltip v-if="item.rol === 'digitador'" text="Lugar armado" location="top">
            </v-tooltip>
            <v-tooltip text="Quitar miembro" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="deleteItem(item)">
                        mdi-account-remove
                    </v-icon>
                </template>
            </v-tooltip>

        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Correo', key: 'correo', align: 'start', sortable: false },
            { title: 'Rol', key: 'rol', align: 'start', sortable: false },
            // { title: 'Lugar de armado', key: 'usuarioDigitador[0].lugarArmado.nombre', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        usuariosDisponibles: [],
        lugaresArmado: [],
        editedItem: {
            id: null,
            nombre: '',
            correo: '',
            rol: '',
            lugar: '',
        },
        defaultItem: {
            id: null,
            nombre: '',
            correo: '',
            rol: '',
            lugar: '',
        },
        editedIndex: -1,
        dialog: false,
        dialogLugar: false,
        dialogDelete: false,
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
                title: `Miembros`,
                disabled: true,
                href: '',
            },
        ]
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo miembro' : 'Editar miembro'
        },
    },
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
        dialog(val) {
            val || this.close()
        },
        dialogLugar(val) {
            val || this.closeLugar()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
    },
    async created() {
        await this.obtenerPosiblesMiembros();
        await this.obtenerLugaresArmado();
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                //obtener id de url
                await axios.get(`/prestadores/miembros`, {
                    params: {
                        id: this.$route.params.id,
                        take: itemsPerPage,
                        page: page,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.miembros;
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
        async obtenerLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/lugarArmados/usuario`, {
                    params: {
                        usuarioId: this.editedItem.id
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.editedItem.lugar = response.data.id;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            }
        },
        async editarLugar(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            await this.obtenerLugar();
            this.dialogLugar = true
        },
        editItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm() {
            await this.eliminarMiembro();
            await this.obtenerPosiblesMiembros();
            this.closeDelete()
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeLugar() {
            this.dialogLugar = false
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
            await this.nuevoMiembro();
            await this.obtenerPosiblesMiembros();
        },
        async saveLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                if (!this.editedItem.lugar) {
                    this.$notify({
                        text: 'Seleccione un lugar de armado',
                        type: 'fallo'
                    });
                    return;
                }
                await axios.post(`/lugarArmados/agregarDigitador`, {
                    lugarArmadoId: this.editedItem.lugar,
                    usuarioId: this.editedItem.id
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.search = String(Date.now());
                    this.$notify({
                        text: `Lugar de armado ${this.editedItem.lugar} asignado correctamente`,
                        type: 'exito'
                    });
                    this.closeLugar()
                }).catch((error) => {
                    console.error('Error al asignar lugar de armado', error);
                    this.$notify({
                        text: 'Error al asignar lugar de armado',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al asignar lugar de armado', error);
            }
        },
        async nuevoMiembro() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                if (this.editedItem.id === null) {
                    this.$notify({
                        text: 'Seleccione un usuario',
                        type: 'fallo'
                    });
                    return;
                }
                const nuevoMiembro = {
                    prestadorId: this.$route.params.id,
                    usuarioId: this.editedItem.id
                }
                await axios.post(`/prestadores/agregarmiembro`, nuevoMiembro, {
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
                    else {
                        this.editedItem = response.data;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        if (this.serverItems.length < this.itemsPerPage) {
                            // Solo agregar si no se ha superado el límite de ítems por página
                            this.serverItems.push(this.editedItem);
                        }
                        this.totalItems += 1;
                        this.$notify({
                            text: `Miembro ${response.data.id} agregado correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }

                }).catch((error) => {
                    console.error('Error al agregar miembro', error);
                    this.$notify({
                        text: 'Error al cagregar miembro',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al agregar miembro', error);
            }
        },
        async eliminarMiembro() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const miembroEliminar = {
                    prestadorId: parseInt(this.$route.params.id),
                    usuarioId: this.editedItem.id
                }
                await axios.post(`/prestadores/eliminarMiembro`, miembroEliminar, {
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
                        text: `Miembro ${this.editedItem.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;

                }).catch((error) => {
                    console.error('Error al quitar miembro', error);
                    this.$notify({
                        text: 'Error al quitar miembro',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al quitar miembro', error);
            }
        },
        async obtenerPosiblesMiembros() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/usuarios/disponibles`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.usuariosDisponibles = response.data;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        },
        async obtenerLugaresArmado() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/lugarArmados/prestador`, {
                    params: {
                        prestadorId: this.$route.params.id,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.lugaresArmado = response.data;
                }).catch((error) => {
                    console.error('Error al cargar los registros', error);
                });
            } catch (error) {
                console.error('Error al cargar los registros', error);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style></style>