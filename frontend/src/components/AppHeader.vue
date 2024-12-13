<template>
  <header>
    <nav>
      <ul>
        <li v-if="!isLoggedIn"><router-link to="/login">Zaloguj</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/register">Zarejestruj</router-link></li>
        <li v-if="isLoggedIn"><router-link to="/moje-kolekcje">Moje Kolekcje</router-link></li>
        <li v-if="isLoggedIn"><router-link to="/profile">Mój Profil</router-link></li>
        <li v-if="isLoggedIn" @click="logout">Wyloguj</li>
      </ul>
    </nav>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['isLoggedIn']),
  },
  methods: {
    ...mapActions(['logout']),
  },
};
</script>
