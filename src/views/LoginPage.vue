<template>
    <v-container fluid class="login-page d-flex justify-center align-center"
        style="height: 100vh; background-color: #006398;">
        <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="6" lg="4">
                <v-card class="login-form">
                    <v-img src="../assets/csf.png" height="60px" style="margin-top: 30px; margin-bottom: 30px;"></v-img>
                    <v-card-title class="text-center d-flex flex-column">Iniciar sesión</v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="login">
                            <div class="text-subtitle-1 text-medium-emphasis">Cuenta</div>
                            <v-text-field v-model="email" density="compact" label="Correo electrónico"
                                prepend-inner-icon="mdi-email-outline"
                                :rules="[rules.email, rules.required]"></v-text-field>
                            <div class="text-subtitle-1 text-medium-emphasis">Contraseña</div>
                            <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="visible ? 'text' : 'password'" density="compact" label="Ingrese su contraseña"
                                prepend-inner-icon="mdi-lock-outline" @click:append-inner="visible = !visible"
                                :rules="[rules.password, rules.required]"></v-text-field>
                            <div class="text-caption text-medium-emphasis">
                                <a href="#" @click.prevent="recuperarContrasenia">¿Olvidaste tu contraseña?</a>
                            </div>
                            <div class="d-flex justify-center">
                                <v-btn type="submit" color="primary" variant="elevated">Iniciar sesión</v-btn>
                            </div>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
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
            visible: false,
            rules: {
                required: value => !!value || 'Campo requerido.',
                password: value => value.length >= 8 || 'Mínimo 8 caracteres',
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Correo invalido'
                },
            }
        };
    },
    created() {
    },
    methods: {
        recuperarContrasenia() {
            this.$router.push('/recuperar');
        },
        parseJwt(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                return JSON.parse(jsonPayload);
            } catch (e) {
                console.error('Error decoding JWT', e);
                return null;
            }
        },
        async login() {
            // Add your login logic here
            try {
                axios.post(`/auth/login`, { correo: this.email, contrasena: this.password }).then(response => {
                    const token = response.data.access_token;
                    const decoded = this.parseJwt(token);
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(decoded));
                    this.$notify({
                        text: 'Inicio de sesión exitoso',
                        type: 'exito'
                    });
                    // Redirigir dependiendo del rol
                    const rol = decoded.rol;
                    if (rol === "admin") {
                        this.$router.push('/usuarios');
                    }
                    else if (rol === "revisor superior") {
                        this.$router.push('/prestadores');
                    }
                    else if (rol === "revisor csf") {
                        this.$router.push('/preliquidar');
                    }
                    else if (rol === "digitador") {
                        this.$router.push('/crearFormulario');
                    }
                    else if (rol === 'prestador') {
                        this.$router.push('/armadosPrestador');
                    }
                    else if (rol === 'operador logistico') {
                        this.$router.push('/recibirCsfAnt');
                    }
                    else if (rol === 'gestor de armado') {
                        this.$router.push('/requis');
                    }
                    else if (rol === 'gestor de adhesivo') {
                        this.$router.push('/prestadores');
                    }
                }).catch(error => {
                    this.$notify({
                        text: error.response.data.message,
                        type: 'fallo'
                    });
                });
            } catch (error) {
                console.error(error);
                this.$notify({
                    text: 'Error al iniciar sesión',
                    type: 'fallo'
                });
            }
        }
    }
};
</script>

<style scoped>
.login-page {
    height: 100vh;
}

.login-form {
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
