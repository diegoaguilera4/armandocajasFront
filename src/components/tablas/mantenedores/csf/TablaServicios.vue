<template>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems" :items-per-page-options="[10,25,50,totalItems]"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        items-per-page-text="Servicios por página" loading-text="Cargando, por favor espere" page-text="{0}-{1} de {2}">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Servicios<v-icon class="mx-2">mdi-hammer-screwdriver</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nuevo servicio
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
                                        <v-textarea prepend-inner-icon="mdi-text" v-model="editedItem.descripcion"
                                            label="Descripcion" :rules="[rules.required]"></v-textarea>
                                    </v-col>
                                    <v-col v-if="this.editedIndex === -1" cols="12" md="12" sm="12">
                                        <v-select chips label="Tipo" v-model="editedItem.tipo"
                                            :items="['Caja armada', 'Otro', 'Caja externa']"></v-select>
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
                                ¿Estás seguro que deseas eliminar este servicio?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{editedItem.codigo}} - {{ editedItem.descripcion }}
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
            <v-tooltip text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editItem(item)">
                        mdi-pencil
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
</template>

<script>
import axios from 'axios';
export default {
    data: () => ({
        itemsPerPage: 10,
        headers: [
            { title: 'Acciones', key: 'actions', sortable: false },
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Código', key: 'codigo', align: 'start', sortable: false },
            { title: 'Descripción', key: 'descripcion', align: 'start', sortable: false },

        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            descripcion: '',
            tipo: null
        },
        defaultItem: {
            descripcion: '',
            tipo: null
        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo servicio' : 'Editar servicio'
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
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/servicio/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.servicios;
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
            await this.eliminarServicio();
            this.closeDelete()
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
            if (this.editedIndex > -1) {
                await this.actualizarServicio();
            } else {
                await this.nuevoServicio();
            }

        },
        verificar() {
            if (this.editedItem.descripcion === '') {
                this.$notify({
                    text: 'Debe ingresar una descripción',
                    type: 'fallo'
                });
                return false;
            }
            return true;
        },
        async nuevoServicio() {
            try {
                if (!this.verificar()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/servicio`, this.editedItem, {
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
                            text: `Servicio ${response.data.id} creado correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }

                }).catch((error) => {
                    console.error('Error al crear nuevo servicio', error);
                    this.$notify({
                        text: 'Error al crear el servicio',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nuevo servicio', error);
            }
        },
        async eliminarServicio() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/servicio/${this.editedItem.id}`, {
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
                        text: `Servicio ${response.data.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;

                }).catch((error) => {
                    console.error('Error al eliminar servicio', error);
                    this.$notify({
                        text: 'Error al eliminar el servicio',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar servicio', error);
            }
        },
        async actualizarServicio() {
            try {
                if (!this.verificar()) {
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                //copiar servicio pero sin id
                let servActualizado = Object.assign({}, this.editedItem);
                delete servActualizado.id;
                await axios.patch(`/servicio/${this.editedItem.id}`, servActualizado, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {

                    if (response.data.status !== 404) {
                        this.editedItem = response.data;
                        this.$notify({
                            text: `Servicio ${this.editedItem.id} actualizado correctamente`,
                            type: 'exito'
                        });
                        this.close()
                    }
                    else {
                        this.$notify({
                            text: `Servicio ${this.editedItem.id} no encontrado`,
                            type: 'fallo'
                        });
                    }

                    Object.assign(this.serverItems[this.editedIndex], this.editedItem)
                }).catch((error) => {
                    console.error('Error al actualizar el servicio', error);
                    this.$notify({
                        text: 'Error al actualizar el servicio',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el servicio', error);
            }
        },
    }
};
</script>

<style></style>