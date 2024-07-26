<template>
	<div class="password-game">
		<h1>UZIK GAME</h1>
		<p>Si vous en avez marre de Pédantix...</p>
		<input v-model="userInput" @input="handleInput" placeholder="Devinez le mot de passe">
		<ErrorMessage v-if="userInput" :result="result" :isResolved="isResolved" />
		<SuccesMessage v-for="resolvedMessage in newResolvedMessage" :key="resolvedMessage" :message="resolvedMessage" />
	</div>
	<div class="password-victory">
		<h1 class="victory">VICTOIRE ! Vous avez trouvé le mot de passe</h1>
		<img class="img-mont-royal" :src="require('@/assets/img/nina.png')" />
		<p>Passez un bon été, on se retrouve en septembre !</p>
		<button @click="replay()">Recommencer</button>
	</div>
</template>
  
<script>
import ErrorMessage from "./ErrorMessage.vue";
import SuccesMessage from "./SuccesMessage.vue";
import { isIngredientPoutineWithUppercase, getDate, checkOdsNumbersRule, getSunsetTime, getTopTrack, victory } from "@/rules";


export default {
	components: {
		ErrorMessage,
		SuccesMessage
	},
	props: {
		hint: String
	},
	data() {
		return {
			sunsetTime: [],
			userInput: "",
			result: "",
			isResolved: false,
			resolvedMessages: [],
			musicToCheck: "",
			rules: [
				{ message: "Le deuxième et l'avant-dernier chiffre du mot de passe doivent être impairs.", test: password => checkOdsNumbersRule(password) },
				{ message: "Je suis arrivée le même jour que ? (Jeanne/Inès/Augustin/Daphné)", test: password => /ines|inès|Inès|Ines/i.test(password) },
				{ message: "Compléter la phrase 'Solo pomodoro solo ...'", test: password => /mutti|Mutti/.test(password) },
				{ message: "Qui gère le Google Home (la musique) mieux que personne dans la team projet ?", test: password => /kevin|Kevin|Kévin|kévin/.test(password) },
				{ message: "Quel a été le jeu phare de l'agence ces deux derniers mois ?", test: password => /Trio|trio|crack list|cracklist|Crack list|Cracklist/.test(password) },
				{ message: "Le mot de passe doit contenir la date du jour. (JJ/MM/AAAA))", test: password => new RegExp(getDate()).test(password) },
				{
					message: "La somme des chiffres du mot de passe doit être égale à 40.", test: password => password
						.split("") // Divise la chaîne en un tableau de caractères
						.filter(char => /\d/.test(char)) // Filtre uniquement les chiffres
						.reduce((acc, curr) => acc + parseInt(curr), 0) === 40
				},
				{ message: "Quel est le prénom du joueur de foot préféré de Flossie ?", test: password => /Griezmann|Antoine|griezmann|antoine/.test(password) },
				{ message: "Le mot de passe doit contenir deux chiffres consécutifs.", test: password => /\d{2}/.test(password) },
				{ message: "Qu'est-ce qu'il ne faut pas oublier le vendredi soir : allez boire l'apéro, prendre le train ou les pointages (mention spéciale à Fred)", test: password => /les pointages|lespointages|Lespointages|Les pointages|pointages|Pointages/i.test(password) },

				{ message: "Le mot de passe doit contenir au moins un caractère spécial : !@#$%&?.", test: password => /[!@#$%&?]+/.test(password) },
				{
					message: "L'ingrédient de l'aligot s'écrit avec une majuscule ! On respecte l'aligot !",
					test: password => {
						const hasPoutineIngredients = /Fromage|Patate|Crème|Tomme|Pomme de terre/i.test(password);
						return isIngredientPoutineWithUppercase(hasPoutineIngredients, password);
					}
				},
				{ message: "Le mot de passe doit contenir au moins un ingrédient de l'aligot", test: password => /fromage|patate|crème|tomme|pomme de terre/i.test(password) },
				{ message: "Le mot de passe doit contenir au moins un chiffre.", test: password => /\d/.test(password) },
				{ message: "Le mot de passe doit commencer par la lettre majuscule. Une phrase commence toujours par une majuscule !", test: password => /^[A-Z]/.test(password) },
				{ message: "Le mot de passe doit contenir au moins une lettre majuscule.", test: password => /[A-Z]/.test(password) },
				{ message: "Le mot de passe doit avoir une longueur d'au moins 8 caractères.", test: password => password.length >= 8 },
			],
		};
	},
	computed: {
		newResolvedMessage: function () {
			return this.resolvedMessages.filter(message => !message.includes("echec"));
		}
	},

	created: function () {
		this.retrieveSunsetTime()
		this.verifTopTrack()
	},

	methods: {
		replay() {
			this.userInput = "";
			const password = document.querySelector('.password-game');
			password.style.display = 'flex';
			this.rulesCheck(this.userInput);

			const victory = document.querySelector('.password-victory');
			victory.style.display = 'none';
		},
		handleInput() {
			if (this.isValidPassword(this.userInput)) {
				this.isResolved = true;
				victory();
			} else {
				this.result = this.rulesCheck(this.userInput);
				this.isResolved = false;
			}
		},


		isValidPassword(password) {
			return this.rules.every(rule => rule.test(password));
		},

		rulesCheck(password) {
			let failingRule = null;
			this.resolvedMessages = [];

			for (const rule of this.rules) {
				const { message, test } = rule;

				if (!test(password)) {
					failingRule = rule;
					this.resolvedMessages.push(`${message} echec`);
				} else {
					this.resolvedMessages.push(`Résolu : ${message}`);
				}
			}
			//console.log("Règles résolues :", this.resolvedMessages);
			return failingRule ? `Échec : ${failingRule.message}` : "ok";
		},

		async retrieveSunsetTime() {
			let sunsetTime = await getSunsetTime();
			sunsetTime = sunsetTime["results"]["sunset"];
			let [sunsetHours, sunsetMinutes] = sunsetTime.split(":");
			this.sunsetTime = [sunsetHours, sunsetMinutes];
		},

		async verifTopTrack() {
			let trackTab = await getTopTrack();
			this.musicToCheck = trackTab['tracks'][0]['name'];
			// let topChristopheMae = trackTab['tracks'][0]['name'];
		}
	},
};
</script>
  
<style scoped>
.password-game {
	width: 60%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: auto;
}

h1 {
	color: cadetblue;
	margin: 5% 0 0;
}

p {
	margin: 0 0 3%;
	font-style: italic;
	color: grey;
}

input {
	width: 80%;
	padding: 2% 2%;
	border-radius: 15px;
	cursor: pointer;
}

.password-victory {
	display: none;
	width: 60%;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: auto;
}

.img-mont-royal {
	width: 20%;
	margin: 5% 0 2%;
	height: auto;
	border-radius: 15px;
}

button {
	width: 20%;
	/* margin: 5% 10% 2%; */
	padding: 2% 2%;
	border-radius: 15px;
	cursor: pointer;
	border: 2px solid cadetblue;
	background: rgb(197, 253, 255);
	transition: 0.3s;
}

button:hover {
	border: 2px solid rgb(34, 86, 88);
	background-color: rgb(122, 149, 150);
	color: white;
}
</style>
  