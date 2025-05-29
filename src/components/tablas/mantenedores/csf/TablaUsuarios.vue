<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="6">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
        </v-row>
    </v-container>

    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Usuarios por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Usuarios<v-icon class="mx-2">mdi-account-group</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-account-multiple-plus" variant="elevated" color="secondary"
                            style="margin-right: 20px" dark v-bind="props">
                            Nuevo usuario
                        </v-btn>
                    </template>
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-h6 text-wrap">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-account" v-model="editedItem.nombre"
                                            label="Nombre" :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-email" v-model="editedItem.correo"
                                            label="Correo" :rules="[rules.required, rules.email]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-select prepend-inner-icon="mdi-badge-account" v-model="editedItem.rol"
                                            label="Rol" :items="roles"></v-select>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-text-field prepend-inner-icon="mdi-lock" v-model="editedItem.contrasena"
                                            label="Contraseña" v-if="!contrasena"
                                            :rules="[rules.required, rules.password]"></v-text-field>
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
                                ¿Estás seguro que deseas eliminar este usuario?
                            </span>
                            <span class="text-h6 text-wrap">Usuario: {{ editedItem.correo }} </span>
                        </v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeDelete">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="deleteItemConfirm">Si, eliminar</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogPassword" max-width="500px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-h6 text-wrap">Cambiar contraseña de {{ editedItem.nombre }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-text-field prepend-inner-icon="mdi-lock" v-model="nuevaContrasena"
                                        label="Ingrese nueva contraeña"
                                        :rules="[rules.required, rules.password]"></v-text-field>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closePassword">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="actualizarContrasena">Guardar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="dialogRol" max-width="500px">
                    <v-card style="border-radius: 20px; padding: 10px;">
                        <v-card-title>
                            <span class="text-h6 text-wrap">Rol momentáneo de {{ editedItem.nombre }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row v-if="this.editedItem.rolMomentaneo.length > 0">
                                    <v-col cols="12" class="d-flex justify-end">
                                        <v-btn style="margin-right: 5px;" density="comfortable" color="#689F38"
                                            icon="mdi-pencil" @click="permitirEditar()"></v-btn>
                                        <v-btn density="comfortable" color="#D32F2F" icon="mdi-delete"
                                            @click="eliminarRolM()"></v-btn>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-select prepend-inner-icon="mdi-badge-account" v-model="nuevoRol" label="Rol"
                                            :items="rolesAux" :disabled="editarRol"></v-select>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-locale-provider locale="es">
                                            <v-date-input v-model="rangoFechaRol" label="Rango de fechas"
                                                prepend-icon="" append-inner-icon="$calendar" cancel-text="cancelar"
                                                multiple="range" ok-text="seleccionar" clearable
                                                @click:clear="reniciarFecha()" :disabled="editarRol"></v-date-input>
                                        </v-locale-provider>
                                    </v-col>
                                </v-row>

                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" variant="elevated" @click="closeRol">Cancelar</v-btn>
                            <v-btn color="primary" variant="elevated" @click="actualizarRol">Guardar</v-btn>
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
            <v-tooltip v-if="item.id !== usuario.id && item.rol !== 'prestador' && item.rol !== 'digitador'"
                text="Rol momentáneo" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#2196F3" @click="abrirRolMomentaneo(item)">
                        mdi-badge-account
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip text="Cambiar contraseña" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#F9A825" @click="cambiarContrasena(item)">
                        mdi-lock
                    </v-icon>
                </template>
            </v-tooltip>
            <!-- Verificar si el usuario es el mismo que el logueado y no permitir eliminarlo -->
            <v-tooltip v-if="item.id !== usuario.id" text="Eliminar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#D32F2F" @click="deleteItem(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-tooltip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
            <v-col>
                <!-- Verificar si el usuario es el mismo que el logueado y no permitir cambiar su estado -->
                <v-switch v-if="item.id !== usuario.id" v-model="item.estado" color="primary" false-value="bloqueado"
                    true-value="activo" @change="cambiarEstado(item)">
                </v-switch>
                <p style="margin-top: -35px;" v-if="item.id !== usuario.id">
                    {{ item.estado }}
                </p>
                <p v-if="item.id === usuario.id">
                    {{ item.estado }}
                </p>
            </v-col>
        </template>
        <template v-slot:[`item.rolMomentaneo[0]`]="{ item }">
            <span v-if="item.rolMomentaneo.length !== 0">{{ item.rolMomentaneo[0].rol }} {{
                formatearFecha(item.rolMomentaneo[0].fechaInicio) }} - {{
                    formatearFecha(item.rolMomentaneo[0].fechaFin) }}</span>
        </template>
        <template v-slot:no-data>
            <p>No hay resultados</p>
        </template>
    </v-data-table-server>

    <v-dialog v-model="dialogEstado" max-width="550px" persistent>
        <v-card style="border-radius: 20px; padding: 10px;">
            <v-card-title>
                <span class="text-center">Comentario de cambio de estado</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-textarea prepend-inner-icon="mdi-comment" v-model="comentario" label="Comentario"
                            :rules="[rules.required]"></v-textarea>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="elevated" @click="guardarEstado()">Guardar</v-btn>
                <v-spacer></v-spacer>
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
            { title: 'ID', key: 'id', align: 'start', sortable: false },
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Correo', key: 'correo', align: 'start', sortable: false },
            { title: 'Rol', key: 'rol', align: 'start', sortable: false },
            { title: 'Rol momentáneo', key: 'rolMomentaneo[0]', align: 'start', sortable: false },
            { title: 'Estado', key: 'estado', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            nombre: '',
            correo: '',
            rol: '',
            estado: '',
            rolMomentaneo: [{
                rol: '',
                fechaInicio: '',
                fechaFin: ''
            }]
        },
        defaultItem: {
            nombre: '',
            correo: '',
            rol: '',
            estado: '',
            rolMomentaneo: [{
                rol: '',
                fechaInicio: '',
                fechaFin: ''
            }]
        },
        nuevaContrasena: '',
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        dialogPassword: false,
        dialogEstado: false,
        dialogRol: false,
        comentario: '',
        usuario: null,
        nuevoRol: '',
        rangoFechaRol: ref([]),
        editarRol: false,
        rules: {
            required: value => !!value || 'Campo requerido.',
            counter: value => value.length <= 20 || 'Max 20 characters',
            password: value => value.length >= 8 || 'Mínimo 8 caracteres',
            email: value => {
                const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                return pattern.test(value) || 'Correo invalido'
            },
        },
        roles: ['admin', 'prestador', 'digitador', 'revisor csf', 'operador logistico', 'revisor superior', 'gestor de armado', 'gestor de adhesivo'],
        rolesM: ['admin', 'revisor csf', 'operador logistico', 'revisor superior', 'gestor de armado', 'gestor de adhesivo']

    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo usuario' : 'Editar usuario'
        },
        contrasena() {
            return this.editedIndex === -1 ? false : true
        },
        estadoSwitch: {
            get() {
                return this.editedItem.estado === 'activo';
            },
            set(value) {
                this.editedItem.estado = value ? 'activo' : 'bloqueado';
            }
        },
        rolesAux: {
            get() {
                return this.rolesM.filter(role => role !== this.editedItem.rol);
            }
        }
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
        dialogPassword(val) {
            val || this.closePassword()
        },
        dialogEstado(val) {
            val || this.closeEstado()
        },
        dialogRol(val) {
            val || this.closeRol()
        }
    },
    created() {
        this.usuario = JSON.parse(localStorage.getItem('user'));
    },
    methods: {
        reniciarFecha() {
            this.rangoFechaRol = [];
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
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/usuarios`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombre,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.usuarios;
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
        cambiarContrasena(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogPassword = true
        },
        abrirRolMomentaneo(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            if (this.editedItem.rolMomentaneo.length > 0) {
                this.nuevoRol = this.editedItem.rolMomentaneo[0].rol;
                this.editarRol = true;
                if (this.editedItem.rolMomentaneo[0].fechaInicio && this.editedItem.rolMomentaneo[0].fechaFin) {
                    this.rangoFechaRol = [new Date(this.editedItem.rolMomentaneo[0].fechaInicio), new Date(this.editedItem.rolMomentaneo[0].fechaFin)];
                }
            }
            else {
                this.editarRol = false;
            }
            this.dialogRol = true
        },
        async eliminarRolM() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/usuarios/quitarRolMomentaneo`,
                    { id: String(this.editedItem.id) }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    this.$notify({
                        text: `Rol momentaneo de usuario ${this.editedItem.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    //borrar 0 de this.editedItem.rolMomentaneo
                    this.editedItem.rolMomentaneo = [];
                    Object.assign(this.serverItems[this.editedIndex], this.editedItem);
                    this.nuevoRol = '';
                    this.rangoFechaRol = [];
                    this.editarRol = false;
                    this.dialogRol = false;
                }).catch((error) => {
                    console.error('Error al eliminar el rol momentaneo', error);
                    this.$notify({
                        text: 'Error al eliminar el rol momentaneo',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar el rol momentaneo', error);
            }
        },
        async actualizarRol() {
            try {
                if (this.nuevoRol === '') {
                    this.$notify({
                        text: 'Debe seleccionar un rol',
                        type: 'fallo'
                    });
                    return;
                }
                //validar que haya seleccionado un rango de fechas
                if (this.rangoFechaRol.length === 0) {
                    this.$notify({
                        text: 'Debe seleccionar un rango de fechas',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const fechaInicio = this.rangoFechaRol[0];
                let fechaFin = this.rangoFechaRol[this.rangoFechaRol.length - 1];
                await axios.post(`/usuarios/agregarRolMomentaneo`, {
                    id: String(this.editedItem.id),
                    rol: this.nuevoRol,
                    fechaInicio,
                    fechaFin
                },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                ).then((response) => {
                    this.$notify({
                        text: `Rol momentaneo de usuario ${response.data.id} actualizado correctamente`,
                        type: 'exito'
                    });
                    this.editedItem.rolMomentaneo[0] = response.data;
                    this.dialogRol = false;
                }).catch((error) => {
                    console.error('Error al actualizar el rol momentaneo', error);
                    this.$notify({
                        text: 'Error al actualizar el rol momentaneo',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el rol momentaneo');
            }
        },
        permitirEditar() {
            this.editarRol = false;
        },
        async deleteItemConfirm() {
            await this.eliminarUsuario();
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
        closePassword() {
            this.dialogPassword = false
            // Limpiar campo de nueva contraseña
            this.nuevaContrasena = '';
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeEstado() {
            this.dialogEstado = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeRol() {
            this.dialogRol = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
            this.nuevoRol = '';
            this.rangoFechaRol = [];
        },
        // Validar campos del formulario de usuario
        validarUsuario() {
            if (this.editedItem.nombre === '') {
                this.$notify({
                    text: 'Debe ingresar un nombre',
                    type: 'fallo'
                });
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editedItem.correo)) {
                this.$notify({
                    text: 'Correo invalido',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedItem.rol === '') {
                this.$notify({
                    text: 'Debe seleccionar un rol',
                    type: 'fallo'
                });
                return false;
            }
            if (this.editedIndex === -1) {
                if (this.editedItem.contrasena === '') {
                    this.$notify({
                        text: 'Debe ingresar una contraseña',
                        type: 'fallo'
                    });
                    return false;
                }
                if (this.editedItem.contrasena.length < 8) {
                    this.$notify({
                        text: 'La contraseña debe tener al menos 8 caracteres',
                        type: 'fallo'
                    });
                    return false;
                }
            }
            return true;
        },
        async save() {
            if (!this.validarUsuario()) {
                return;
            }
            if (this.editedIndex > -1) {
                await this.actualizarUsuario();
            } else {
                await this.nuevoUsuario();
            }
            this.close()
        },
        async nuevoUsuario() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.post(`/usuarios`, this.editedItem, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    // Verificar si ya alcanzó el número máximo de ítems por página
                    if (this.serverItems.length < this.itemsPerPage) {
                        // Solo agregar si no se ha superado el límite de ítems por página
                        this.serverItems.push(response.data);
                    }
                    this.totalItems += 1;
                    this.$notify({
                        text: `Usuario ${response.data.id} creado correctamente`,
                        type: 'exito'
                    });
                }).catch((error) => {
                    console.error('Error al crear nuevo usuario', error);
                    this.$notify({
                        text: 'Error al crear el usuario',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nuevo usuario', error);
            }
        },
        async eliminarUsuario() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/usuarios/${this.editedItem.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status === 404) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        this.closeDelete()
                        return;
                    }
                    this.$notify({
                        text: `Usuario ${response.data.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1)
                    this.totalItems -= 1;
                    this.closeDelete()

                }).catch((error) => {
                    console.error('Error al eliminar un usuario', error.message);
                    this.$notify({
                        text: 'Error al eliminar el usuario',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar un usuario', error.message);
            }
        },
        async actualizarUsuario() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                const usuarioActualizado = {
                    nombre: this.editedItem.nombre,
                    correo: this.editedItem.correo,
                    rol: this.editedItem.rol
                };
                await axios.patch(`/usuarios/${this.editedItem.id}`, usuarioActualizado, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.$notify({
                        text: `Usuario ${response.data.id} actualizado correctamente`,
                        type: 'exito'
                    });
                    Object.assign(this.serverItems[this.editedIndex], this.editedItem)

                }).catch((error) => {
                    console.error('Error al actualizar el usuario', error);
                    this.$notify({
                        text: 'Error al actualizar el usuario',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar un nuevo', error);
            }
        },
        async actualizarContrasena() {
            try {
                if (this.nuevaContrasena.length < 8) {
                    this.$notify({
                        text: 'Debe ingresar una contraseña valida',
                        type: 'fallo'
                    });
                    return;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.patch(`/usuarios/${this.editedItem.id}/password`, { "contrasena": this.nuevaContrasena }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.$notify({
                        text: `Contraseña de usuario ${response.data.id} actualizada correctamente`,
                        type: 'exito'
                    });
                    this.nuevaContrasena = '';
                    this.closePassword()

                }).catch((error) => {
                    console.error('Error al actualizar un nuevo', error);
                });
            } catch (error) {
                console.error('Error al actualizar un nuevo', error);
            }
        },
        async guardarEstado() {
            try {
                if (this.comentario === '') {
                    this.$notify({
                        text: 'Debe ingresar un comentario',
                        type: 'fallo'
                    });
                    return false;
                }
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.patch(`/usuarios/estado/${this.editedItem.id}`, { estado: this.editedItem.estado, comentario: this.comentario }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.$notify({
                        text: `Estado de usuario ${response.data.id} actualizado a ${this.editedItem.estado}`,
                        type: 'exito'
                    });
                    this.dialogEstado = false;
                    this.comentario = '';
                }).catch((error) => {
                    console.error('Error al actualizar el estado del usuario', error);
                    this.$notify({
                        text: 'Error al actualizar el estado del usuario',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el estado del usuario', error);
            }
        },
        cambiarEstado(item) {
            this.editedIndex = this.serverItems.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogEstado = true;
        }
    }
};
</script>

<style></style>