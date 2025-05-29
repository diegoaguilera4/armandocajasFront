<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <div class="d-flex justify-center align-center">
                <v-card
                    style="border-radius: 20px; max-width: 500px; width: 100%;">
                    <v-col cols="12">
                        <v-select prepend-inner-icon="mdi-magnify" v-model="lugarArmadoId" label="Seleccione lugar de armado" variant="solo-filled"
                            chips clearable :items="lugares" item-title="nombre" item-value="id">
                        </v-select>
                    </v-col>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="elevated" @click="crearForm()">Crear formulario</v-btn>
                        <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import axios from 'axios';
export default {
    components: {
        DrawerMenu
    },
    data: () => ({
        user: null,
        lugares: [],
        lugarArmadoId: null,
        loading: true,
    }),
    async created() {
        this.user = JSON.parse(localStorage.getItem('user'));
        await this.obtenerLugares();
    },
    methods: {
        async obtenerLugares() {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No token found");
            }
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.get(`/lugarArmados/prestador`, {
                params: {
                    prestadorId: user.prestador[0].prestadorId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                this.lugares = response.data;
            }).catch(error => {
                console.error('Error al cargar los lugares', error);
            });
        },
        crearForm() {
            if (this.lugarArmadoId) {
                //Guardar el lugar seleccionado en el localStorage
                const lugar = this.lugares.find(lugar => lugar.id === this.lugarArmadoId);
                localStorage.setItem('lugarArmado', JSON.stringify(lugar));
                this.$router.push('/formularioV2');
            } else {
                this.$notify({
                    type: 'fallo',
                    text: 'Seleccione un lugar de armado',
                });
            }
        }
    }
}
</script>

<style></style>