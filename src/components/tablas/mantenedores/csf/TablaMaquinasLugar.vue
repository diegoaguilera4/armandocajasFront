<template>
    <v-breadcrumbs bg-color="primary" :items="items" divider="/"></v-breadcrumbs>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="_id" @update:options="loadItems"
        items-per-page-text="Máquinas por página" page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Máquinas de {{ this.$route.params.nombre }} <v-icon
                        class="mx-2">mdi-engine</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-plus-circle" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Asignar máquina
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-center">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12">
                                        <v-autocomplete prepend-inner-icon="mdi-engine" v-model="editedItem.maquinaId"
                                            label="Seleccione máquina" chips :items="maquinas" item-title="nmaquina"
                                            item-value="id" variant="solo-filled">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="item.raw.nombre + ' - ' + item.raw.marca + ' - ' + item.raw.modelo"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="guiaDespacho" label="Guía de despacho"
                                            :rules="[rules.required]">
                                        </v-text-field>
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
                                ¿Estás seguro que deseas quitar esta máquina?
                            </span>
                        </v-card-title>
                        <v-card-text>
                            ¿Dónde deseas enviar la máquina?
                            <v-container>
                                <v-row>
                                    <v-col cols="6" md="4" sm="4">
                                        <v-text-field v-model="editedItem.maquina.nmaquina" label="N° máquina" readonly>
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="6" md="8" sm="8">
                                        <v-text-field v-model="editedItem.maquina.nombre" label="Nombre" readonly>
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="6" md="6" sm="6">
                                        <v-text-field v-model="editedItem.maquina.marca" label="Marca" readonly>
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="6" md="6" sm="6">
                                        <v-text-field v-model="editedItem.maquina.modelo" label="Modelo" readonly>
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                        <v-select v-model="estadoMaquina" :items="['Bodega', 'Taller']"
                                            label="Enviar a"></v-select>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field v-model="guiaDespacho" label="Guía de despacho"
                                            :rules="[rules.required]">
                                        </v-text-field>
                                    </v-col>
                                </v-row>

                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeDelete">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="deleteItemConfirm">Si, quitar</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
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
            { title: 'N° máquina', key: 'maquina.nmaquina', align: 'start', sortable: false },
            { title: 'Nombre', key: 'maquina.nombre', align: 'start', sortable: false },
            { title: 'Marca', key: 'maquina.marca', align: 'start', sortable: false },
            { title: 'Modelo', key: 'maquina.modelo', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            lugarArmadoId: '',
            maquinaId: null,
            maquina: {
                nmaquina: '',
                nombre: '',
                marca: '',
                modelo: '',
            },
        },
        defaultItem: {
            lugarArmadoId: '',
            maquinaId: null,
            maquina: {
                nmaquina: '',
                nombre: '',
                marca: '',
                modelo: '',
            }
        },
        maquinas: [],
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        items: [
            {
                title: 'Lugares de armado',
                disabled: false,
                href: '/lugaresArmado',
            },
            {
                title: `Máquinas`,
                disabled: true,
                href: '',
            },
        ],
        estadoMaquina: '',
        guiaDespacho: '',
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Asignar máquina' : 'Editar máquina';
        },
    },
    watch: {
        dialog(val) {
            if (!val) {
                this.close();
            }
        },
        dialogDelete(val) {
            if (!val) {
                this.closeDelete();
            }
        },
    },
    async created() {
        await this.obtenerMaquinas();
    },
    methods: {
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquinaLugar/lugar`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        id: this.$route.params.id
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.maquinas;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar maquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar maquinas', error);
            } finally {
                this.loading = false;
            }
        },
        async obtenerMaquinas() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/maquina/disponibles`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.maquinas = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las maquinas', error);
                });
            } catch (error) {
                console.error('Error al cargar las maquinas', error);
            }
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },
        async deleteItemConfirm() {
            await this.eliminarMaquina();
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },
        async save() {
            await this.asignarMaquina();
            await this.obtenerMaquinas();
        },
        async asignarMaquina() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                this.editedItem.lugarArmadoId = parseInt(this.$route.params.id);
                this.editedItem.maquinaId = parseInt(this.editedItem.maquinaId);
                const ids = {
                    lugarArmadoId: this.editedItem.lugarArmadoId,
                    maquinaId: this.editedItem.maquinaId
                }
                await axios.post(`/maquinaLugar`, { ids, guia: this.guiaDespacho }, {
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
                    } else {
                        this.editedItem = response.data;
                        // Verificar si ya alcanzó el número máximo de ítems por página
                        if (this.serverItems.length < this.itemsPerPage) {
                            // Solo agregar si no se ha superado el límite de ítems por página
                            this.serverItems.push(this.editedItem);
                        }
                        this.totalItems += 1;
                        this.$notify({
                            text: `Máquina ${response.data.maquina.nmaquina} asignada correctamente`,
                            type: 'exito'
                        });
                        this.guiaDespacho = '';
                        this.close();
                    }
                }).catch((error) => {
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al asignar nueva máquina', error);
            }
        },
        async eliminarMaquina() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                //Verificar si el estado de la máquina es nulo
                if (this.estadoMaquina === '') {
                    this.$notify({
                        text: 'Debe seleccionar un estado para la máquina',
                        type: 'fallo'
                    });
                    return;
                }
                await axios.delete(`/maquinaLugar/${this.editedItem.maquinaId}/${this.editedItem.lugarArmadoId}/${this.estadoMaquina}/${this.guiaDespacho}`, {
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
                        text: `Máquina ${response.data.maquina.nmaquina} eliminada correctamente`,
                        type: 'exito'
                    });
                    this.guiaDespacho = '';
                    this.estadoMaquina = '';
                    this.obtenerMaquinas();
                    this.serverItems.splice(this.editedIndex, 1);
                    this.totalItems -= 1;
                    this.closeDelete();

                }).catch((error) => {
                    console.error('Error al eliminar la máquina', error);
                    this.$notify({
                        text: 'Error al eliminar la máquina',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar la máquina', error);
            }
        },
    }
};
</script>

<style></style>