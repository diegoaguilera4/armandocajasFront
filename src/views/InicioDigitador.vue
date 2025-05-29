<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
                <MenuDigitador />
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import MenuDigitador from '@/components/menus/MenuDigitador.vue';

export default {
    components: {
        DrawerMenu, MenuDigitador
    },
    data: () => ({

    }),
}
</script>

<style></style>