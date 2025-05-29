<template>
    <v-container fluid class="page d-flex justify-center align-center"
        style="height: 100vh; background-color: #006398;">
        <v-row justify="center" align="center">
            <v-card class="form" style="width: 450px;">
                <v-card-title class="text-center d-flex flex-column">Cambiar contraseña</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="cambiarContrasenia" style="margin-top: 20px;">
                        <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                            :type="visible ? 'text' : 'password'" density="compact" label="Ingrese contraseña"
                            prepend-inner-icon="mdi-lock-outline" @click:append-inner="visible = !visible"
                            :rules="[rules.password, rules.required]"></v-text-field>
                        <v-text-field v-model="password2" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                            :type="visible ? 'text' : 'password'" density="compact" label="Reingrese contraseña"
                            prepend-inner-icon="mdi-lock-outline" @click:append-inner="visible = !visible"
                            :rules="[rules.password, rules.required]"></v-text-field>
                        <v-row class="d-flex justify-center">
                            <v-btn type="submit" color="primary" variant="elevated">Recuperar contraseña</v-btn>
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
            password: '',
            password2: '',
            visible: false,
            rules: {
                password: value => value.length >= 8 || 'Mínimo 8 caracteres',
                required: value => !!value || 'Campo requerido.',
            },
            token: '',
            usuarioId: null,
        };
    },
    async created() {
        this.token = this.$route.params.token;
        await this.verificarToken();
    },
    methods: {
        async verificarToken() {
            try {
                await axios.post('/auth/verify', {
                    token: this.token
                }).then(response => {
                    if (response.data.error) {
                        this.$notify({
                            text: response.data.message,
                            type: 'fallo'
                        });
                        this.$router.push('/');
                    }
                    else {
                        this.usuarioId = response.data.id;
                    }
                }).catch(error => {
                    console.error(error);
                    this.$notify({
                        text: 'Error al verificar token',
                        type: 'fallo'
                    });
                    this.$router.push('/');
                });
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al verificar token',
                    type: 'fallo'
                });
            }
        },
        verificarPasswords() {
            if (this.password === this.password2) {
                return true;
            }
            else {
                this.$notify({
                    text: 'Las contraseñas no coinciden',
                    type: 'fallo'
                });
                return false;
            }
        },
        async cambiarContrasenia() {
            try {
                if (!this.verificarPasswords()) {
                    return;
                }
                await axios.patch(`/usuarios/${this.usuarioId}/password`, { "contrasena": this.password2 }, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                }).then(() => {
                    this.$notify({
                        text: `Contraseña de usuario actualizada correctamente`,
                        type: 'exito'
                    });
                    this.$router.push('/');
                }).catch((error) => {
                    console.error('Error al actualizar un nuevo', error);
                });
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al cambiar contraseña',
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
