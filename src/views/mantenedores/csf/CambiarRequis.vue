<template>
    <v-app>
        <DrawerMenu />
        <v-main style="background-color: #E0E0E0;">
            <v-card style="margin-left: 2%; margin-bottom: 2%; margin-right: 2%; border-radius: 20px;">
                <TablaRequis/>
            </v-card>
        </v-main>
    </v-app>
</template>

<script>
import DrawerMenu from '@/components/menus/DrawerMenu.vue';
import TablaRequis from '@/components/tablas/mantenedores/csf/TablaRequis.vue';
export default {
    components: {
        DrawerMenu, TablaRequis
    },
    data: () => ({

    }),
}
</script>

<style></style>