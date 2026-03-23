import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/pages/Home.vue';
import Login from '@/views/pages/Login.vue';
import SingleItem from '@/views/pages/SingleItem.vue';
import CreateItem from '@/views/pages/CreateItem.vue';
import CreateAccount from '@/views/pages/CreateAccount.vue';
import userInformation from '@/views/pages/userInformation.vue';
import GetQuestions from '@/views/pages/GetQuestions.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/users', name: 'Create Account', component: CreateAccount
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
      {
    path: '/item/:id/questions',
    name: 'Questions',
    component: GetQuestions
  },
  { path: '/item/:id', component: SingleItem },

  {path: '/create', name: 'createItem', component: CreateItem, meta: { requiresAuth: true}},

  {path: '/users/:user_id', name: 'userInformation', component: userInformation, props: true},
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
