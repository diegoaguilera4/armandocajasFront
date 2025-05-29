<template>
    <v-container fluid class="d-flex">
        <v-row class="d-flex">
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-text-field prepend-inner-icon="mdi-magnify" v-model="nombre" label="Nombre" hide-details
                    clearable></v-text-field>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="3">
                <v-autocomplete prepend-inner-icon="mdi-magnify" v-model="filtroPrestador" label="Prestador" chips
                    clearable :items="prestadores" item-title="nombreCorto" item-value="id">
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                    </template>
                </v-autocomplete>
            </v-col>
        </v-row>
    </v-container>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-per-page-options="[10, 25, 50, totalItems]" :items-length="totalItems" :loading="loading"
        :search="search" item-value="_id" @update:options="loadItems" items-per-page-text="Lugares por página"
        page-text="{0}-{1} de {2}" loading-text="Cargando, por favor espere">
        <template v-slot:top>
            <v-toolbar flat style="background-color: #006398; color: white;">
                <v-toolbar-title>Lugares de armado<v-icon class="mx-2">mdi-package-variant</v-icon></v-toolbar-title>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ props }">
                        <v-btn append-icon="mdi-file-excel" variant="elevated" color="green"
                            @click="exportarExcel()">Exportar</v-btn>
                        <v-btn append-icon="mdi-package-variant" variant="elevated" color="secondary"
                            style="margin-right: 20px; margin-left: 10px;" dark v-bind="props">
                            Nuevo lugar
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
                                        <v-text-field prepend-inner-icon="mdi-package-variant"
                                            v-model="editedItem.nombre" label="Nombre"
                                            :rules="[rules.required]"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete prepend-inner-icon="mdi-package"
                                            v-model="editedItem.prestadorId" label="Selecciona prestador" chips
                                            :items="prestadores" item-title="nombreCorto" item-value="id">
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props" :subtitle="item.raw.nombre"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete v-if="editedItem.prestadorId" v-model="editedItem.zonaId"
                                            label="Selecciona zona" :items="zonasFiltradas" item-title="nombre"
                                            item-value="id" prepend-inner-icon="mdi-map-marker" chips>
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="'ID: ' + item.raw.id"></v-list-item>
                                            </template>
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" md="12" sm="12">
                                        <v-autocomplete v-if="editedItem.zonaId" prepend-inner-icon="mdi-city"
                                            v-model="this.editedItem.ciudad" :items="ciudadesFiltradas"
                                            item-title="CIUDAD" label="Selecione ciudad" :item-value="ciudad => ciudad"
                                            chips>
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props"
                                                    :subtitle="item.raw.PROVINCIA + '-' + item.raw.REGION + ' (' + item.raw.NUM_REGION.trim() + ')'"></v-list-item>
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
                                ¿Estás seguro que deseas eliminar este lugar?
                            </span>
                            <span class="text-h6 text-wrap">
                                {{ editedItem.nombre }}
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
        <template v-slot:[`item.prestadorNombre`]="{ item }">
            <span>{{ item.prestador.nombreCorto}}</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip v-if="rol === 'admin' || rol === 'revisor superior' || rolAux === 'revisor superior'"
                text="Editar" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#689F38" @click="editItem(item)">
                        mdi-pencil
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="rol === 'admin' || rol === 'revisor superior' || rolAux === 'revisor superior'"
                text="Precio servicios" location="top">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" class="me-2" size="large" color="#FB8C00" @click="precioServicios(item)">
                        mdi-currency-usd
                    </v-icon>
                </template>
            </v-tooltip>
            <v-tooltip v-if="rol === 'admin' || rol === 'revisor superior' || rolAux === 'revisor superior'"
                text="Eliminar" location="top">
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
            { title: 'Nombre', key: 'nombre', align: 'start', sortable: false },
            { title: 'Prestador', key: 'prestadorNombre', align: 'start', sortable: false },
            { title: 'Ciudad', key: 'ciudad', align: 'start', sortable: false },
            { title: 'Region', key: 'region', align: 'start', sortable: false },
            { title: 'Zona', key: 'zona.nombre', align: 'start', sortable: false },
        ],
        serverItems: [],
        loading: true,
        totalItems: 0,
        nombre: '',
        search: '',
        editedItem: {
            nombre: '',
            prestadorId: null,
            zonaId: null,
            ciudad: null,
        },
        defaultItem: {
            nombre: '',
            prestadorId: null,
            zonaId: null,
            ciudad: null

        },
        editedIndex: -1,
        dialog: false,
        dialogDelete: false,
        filtroPrestador: null,
        zonas: [],
        prestadores: [],
        zonasFiltradas: [],
        rules: {
            required: value => !!value || 'Campo requerido.',
        },
        ciudadesFiltradas: [],
        rol: null,
        rolesMomentaneo: [],
        rolAux: null,
    }),
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Nuevo lugar' : 'Editar lugar';
        },
    },
    watch: {
        nombre() {
            this.search = String(Date.now());
        },
        filtroPrestador() {
            this.search = String(Date.now());
        },
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
        'editedItem.prestadorId'(newPrestadorId) {
            if (newPrestadorId) {
                // No restablezcas zonaId si ya está seleccionada y pertenece al prestador
                const prestadorSeleccionado = this.prestadores.find(p => p.id === newPrestadorId);
                if (prestadorSeleccionado) {
                    this.zonasFiltradas = prestadorSeleccionado.zonas;
                    // Verifica si la zonaId seleccionada es válida para el prestador actual
                    const zonaValida = this.zonasFiltradas.some(zona => zona.id === this.editedItem.zonaId);
                    if (!zonaValida) {
                        this.editedItem.zonaId = null; // Restablece solo si la zona no es válida
                    }
                } else {
                    this.zonasFiltradas = [];
                    this.editedItem.zonaId = null;
                }
            } else {
                this.zonasFiltradas = [];
                this.editedItem.zonaId = null;
            }
        },
        'editedItem.zonaId'(newZonaId, oldZonaId) {
            //si son distintas zonas reestablecer ciudad
            if ((oldZonaId !== newZonaId) && oldZonaId !== null) {
                this.editedItem.ciudad = null;
            }
            //filtrar las ciudades donde la ciudad.REGION sea igual a newZonaId
            if (newZonaId) {
                //no reestablecer ciudad si ya está seleccionada y pertenece a la zona
                //buscar en zonasFiltradas la zona con id newZonaId
                const zonaSeleccionada = this.zonasFiltradas.find(zona => zona.id === newZonaId);
                //ahora que la zona tiene regiones mostrar las ciudades que tengan region igual a regionNumero
                if (zonaSeleccionada) {
                    //formatear a solo numeros
                    const regiones = zonaSeleccionada.regiones.map(region => parseInt(region.regionNumero));
                    //filtrar en ciudades las ciudades que tengan NUM_REGION igual a regionNumero
                    this.ciudadesFiltradas = this.ciudades.filter(ciudad => regiones.includes(parseInt(ciudad.NUM_REGION)));

                } else {
                    this.ciudadesFiltradas = [];
                    this.editedItem.ciudad = null;
                }

            } else {
                this.ciudadesFiltradas = [];
            }
        }
    },
    async created() {
        await this.obtenerPrestadores();
        await this.obtenerCiudades();
        const user = JSON.parse(localStorage.getItem('user'));
        this.rol = user.rol;
        this.rolMomentaneo = user ? user.rolMomentaneo : [];
        //verificar que rolMomentaneo[0].fechaInicio < hoy < rolMomentaneo[0].fechaFin
        if (this.rolMomentaneo.length > 0) {
            const fechaInicio = new Date(this.rolMomentaneo[0].fechaInicio);
            const fechaFin = new Date(this.rolMomentaneo[0].fechaFin);
            const hoy = new Date();
            if (hoy >= fechaInicio && hoy <= fechaFin) {
                this.rolAux = this.rolMomentaneo[0].rol;
            }
        }
    },
    methods: {
        async exportarExcel() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get('/lugarArmados/exportar/excel',
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            nombre: this.nombre,
                            prestadorId: this.filtroPrestador
                        }
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'lugares_armado.xlsx');
                        document.body.appendChild(link);
                        link.click();
                    }
                    ).catch((error) => {
                        console.error('Error al exportar a excel', error);
                    });
            } catch (error) {
                console.error('Error al exportar a excel', error);
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
                    console.error('Error al cargar las regiones', error);
                });
            } catch (error) {
                console.error('Error al cargar las regiones', error);
            }
        },
        async obtenerCiudades() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/database/obtenerCiudades`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.ciudades = response.data;
                }).catch((error) => {
                    console.error('Error al cargar las ciudades', error);
                });
            } catch (error) {
                console.error('Error al cargar las ciudades', error);
            }
        },
        async loadItems({ page, itemsPerPage } = {}) {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.get(`/lugarArmados/paginado`, {
                    params: {
                        take: itemsPerPage,
                        page: page,
                        nombre: this.nombre,
                        prestadorId: this.filtroPrestador
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    this.serverItems = response.data.lugarArmados;
                    this.totalItems = response.data.total;
                }).catch((error) => {
                    console.error('Error al cargar lugares', error);
                });
            } catch (error) {
                console.error('Error al cargar lugares', error);
            } finally {
                this.loading = false;
            }
        },
        editItem(item) {
            this.regionesSeleccionadas = item.regiones;
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },
        deleteItem(item) {
            this.editedIndex = this.serverItems.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },
        async deleteItemConfirm() {
            await this.eliminarLugar();
            this.closeDelete();
        },
        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
                this.regionesSeleccionadas = []; // Restablecer regiones seleccionadas
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
            if (this.editedIndex > -1) {
                await this.actualizarLugar();
            } else {
                await this.nuevoLugar();
            }
        },
        async nuevoLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                let nuevoLugar = {
                    nombre: this.editedItem.nombre,
                    prestadorId: this.editedItem.prestadorId,
                    ciudad: this.editedItem.ciudad.CIUDAD,
                    region: parseInt(this.editedItem.ciudad.NUM_REGION),
                    zonaId: this.editedItem.zonaId
                }
                await axios.post(`/lugarArmados`, nuevoLugar, {
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
                            text: `Lugar ${response.data.id} creado correctamente`,
                            type: 'exito'
                        });
                        this.regionesSeleccionadas = [];
                        this.ciudadesFiltradas = [];
                        this.close();
                    }
                }).catch((error) => {
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al crear nuevo lugar', error);
            }
        },
        async eliminarLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                await axios.delete(`/lugarArmados/${this.editedItem.id}`, {
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
                        text: `Lugar ${response.data.id} eliminado correctamente`,
                        type: 'exito'
                    });
                    this.serverItems.splice(this.editedIndex, 1);
                    this.totalItems -= 1;
                    this.regionesSeleccionadas = [];
                }).catch((error) => {
                    console.error('Error al eliminar el lugar', error);
                    this.$notify({
                        text: 'Error al eliminar el lugar',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al eliminar el lugar', error);
            }
        },
        async actualizarLugar() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("No token found");
                }
                if(!this.editedItem.ciudad.NUM_REGION){
                    //buscar la ciudad en la lista de ciudades
                    const ciudad = this.ciudadesFiltradas.find(ciudad => ciudad.CIUDAD === this.editedItem.ciudad && ciudad.NUM_REGION.trim() === this.editedItem.region.toString());
                    if(ciudad){
                        this.editedItem.ciudad = ciudad;
                    }
                }
                const lugarActualizado = {
                    nombre: this.editedItem.nombre,
                    prestadorId: this.editedItem.prestadorId,
                    zonaId: this.editedItem.zonaId,
                    region: parseInt(this.editedItem.ciudad.NUM_REGION.trim()),
                    ciudad: this.editedItem.ciudad.CIUDAD,
                }
                console.log(lugarActualizado);
                await axios.patch(`/lugarArmados/${this.editedItem.id}`, lugarActualizado, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then((response) => {
                    if (response.data.status !== 404) {
                        this.$notify({
                            text: `Lugar ${this.editedItem.id} actualizado correctamente`,
                            type: 'exito'
                        });
                        this.editedItem.prestador = response.data.prestador;
                        this.editedItem.ciudad = response.data.ciudad;
                        this.editedItem.region = response.data.region;
                        this.editedItem.zona = response.data.zona;
                        Object.assign(this.serverItems[this.editedIndex], this.editedItem);
                        this.close();
                    } else {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                    }
                }).catch((error) => {
                    console.error('Error al actualizar el lugar', error);
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error('Error al actualizar el lugar', error);
            }
        },
        precioServicios(item) {
            this.$router.push(`/precioServiciosLugar/${item.id}/${item.nombre}`);
        },
        maquinas(item) {
            this.$router.push(`/maquinasLugar/${item.id}/${item.nombre}`);
        }
    }
};
</script>

<style></style>