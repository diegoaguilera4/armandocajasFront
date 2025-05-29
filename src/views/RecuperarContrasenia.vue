<template>
    <v-container fluid class="page d-flex justify-center align-center"
        style="height: 100vh; background-color: #006398;">
        <v-row justify="center" align="center">
                <v-card class="form" style="max-width: 400px;">
                    <v-card-title class="text-center d-flex flex-column">Recuperar contraseña</v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="recuperar" style="margin-top: 20px;">
                            <v-text-field v-model="email" density="compact" label="Correo electrónico"
                                prepend-inner-icon="mdi-email-outline"
                                :rules="[rules.email, rules.required]"></v-text-field>
                            <v-row class="d-flex justify-center">
                                <v-btn type="submit" color="primary" variant="elevated">Recuperar contraseña</v-btn>
                                <!-- volver a login -->
                                <v-btn style="margin-left: 5px;" color="secondary" variant="elevated"
                                    @click="$router.push('/')">Volver a login</v-btn>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            email: '',
            visible: false,
            rules: {
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Correo invalido'
                },
            }
        };
    },
    methods: {
        async recuperar() {
            try {
                await axios.post('/usuarios/recuperarContrasenia', {
                    correo: this.email
                }).then(response => {
                    if (response.data.exito) {
                        this.$notify({
                            text: response.data.mensaje,
                            type: 'exito'
                        });
                        this.$router.push('/');
                    }
                    else{
                        this.$notify({
                            text: response.data.mensaje,
                            type: 'fallo'
                        });
                    }

                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al recuperar contraseña',
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al recuperar contraseña',
                    type: 'fallo'
                });
            }
        }
    }
};
</script>

<style scoped>
.page {
    height: 100vh;
}

.form {
    padding: 20px;
    border-radius: 25px;
}

.text-center {
    text-align: center;
}

.v-btn {
    margin-top: 20px;
    border-radius: 20px;
}
</style>
