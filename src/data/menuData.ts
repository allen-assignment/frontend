import { MenuItem } from '../context/CartContext';

// export const menuData: MenuItem[] = [
//   // Appetizers
//   {
//     id: '1',
//     name: 'Crispy Calamari',
//     description: 'Lightly battered calamari served with a zesty lemon aioli',
//     price: 12.99,
//     image: 'https://images.pexels.com/photos/7474372/pexels-photo-7474372.jpeg',
//     category: 'appetizers',
//     dietary: ['seafood'],
//   },
//   {
//     id: '2',
//     name: 'Bruschetta',
//     description: 'Grilled bread topped with tomatoes, fresh basil, garlic and olive oil',
//     price: 9.99,
//     image: 'https://images.pexels.com/photos/7813536/pexels-photo-7813536.jpeg',
//     category: 'appetizers',
//     dietary: ['vegetarian'],
//   },
//   {
//     id: '3',
//     name: 'Spinach Artichoke Dip',
//     description: 'Creamy spinach dip with artichokes, served with tortilla chips',
//     price: 11.99,
//     image: 'https://images.pexels.com/photos/7538100/pexels-photo-7538100.jpeg',
//     category: 'appetizers',
//     dietary: ['vegetarian'],
//   },

//   // Main Courses
//   {
//     id: '4',
//     name: 'Grilled Salmon',
//     description: 'Fresh Atlantic salmon with lemon herb butter, served with seasonal vegetables',
//     price: 24.99,
//     image: 'https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg',
//     category: 'main',
//     dietary: ['seafood', 'gluten-free'],
//   },
//   {
//     id: '5',
//     name: 'Filet Mignon',
//     description: '8oz prime beef tenderloin with red wine reduction and truffle mashed potatoes',
//     price: 34.99,
//     image: 'https://images.pexels.com/photos/3997609/pexels-photo-3997609.jpeg',
//     category: 'main',
//   },
//   {
//     id: '6',
//     name: 'Mushroom Risotto',
//     description: 'Creamy Arborio rice with wild mushrooms, parmesan, and truffle oil',
//     price: 19.99,
//     image: 'https://images.pexels.com/photos/5638766/pexels-photo-5638766.jpeg',
//     category: 'main',
//     dietary: ['vegetarian', 'gluten-free'],
//   },
//   {
//     id: '7',
//     name: 'Pasta Primavera',
//     description: 'Fresh linguine with seasonal vegetables in a light garlic cream sauce',
//     price: 17.99,
//     image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg',
//     category: 'main',
//     dietary: ['vegetarian'],
//   },

//   // Burgers & Sandwiches
//   {
//     id: '8',
//     name: 'Classic Cheeseburger',
//     description: 'Half-pound Angus beef with cheddar, lettuce, tomato, and special sauce',
//     price: 16.99,
//     image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg',
//     category: 'burgers',
//   },
//   {
//     id: '9',
//     name: 'Grilled Chicken Sandwich',
//     description: 'Marinated chicken breast with avocado, bacon, and chipotle mayo',
//     price: 14.99,
//     image: 'https://images.pexels.com/photos/5337811/pexels-photo-5337811.jpeg',
//     category: 'burgers',
//   },
//   {
//     id: '10',
//     name: 'Portobello Burger',
//     description: 'Grilled portobello mushroom with roasted red peppers and goat cheese',
//     price: 13.99,
//     image: 'https://images.pexels.com/photos/5908206/pexels-photo-5908206.jpeg',
//     category: 'burgers',
//     dietary: ['vegetarian'],
//   },

//   // Salads
//   {
//     id: '11',
//     name: 'Caesar Salad',
//     description: 'Crisp romaine, parmesan, house-made croutons with classic Caesar dressing',
//     price: 10.99,
//     image: 'https://images.pexels.com/photos/3662136/pexels-photo-3662136.jpeg',
//     category: 'salads',
//   },
//   {
//     id: '12',
//     name: 'Caprese Salad',
//     description: 'Fresh mozzarella, heirloom tomatoes, basil, with balsamic reduction',
//     price: 12.99,
//     image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
//     category: 'salads',
//     dietary: ['vegetarian', 'gluten-free'],
//   },

//   // Sides
//   {
//     id: '13',
//     name: 'Truffle Fries',
//     description: 'Crispy fries tossed with truffle oil, parmesan, and herbs',
//     price: 7.99,
//     image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
//     category: 'sides',
//     dietary: ['vegetarian'],
//   },
//   {
//     id: '14',
//     name: 'Garlic Mashed Potatoes',
//     description: 'Creamy potatoes with roasted garlic and chives',
//     price: 5.99,
//     image: 'https://images.pexels.com/photos/6937455/pexels-photo-6937455.jpeg',
//     category: 'sides',
//     dietary: ['vegetarian', 'gluten-free'],
//   },

//   // Desserts
//   {
//     id: '15',
//     name: 'Chocolate Fondant',
//     description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
//     price: 9.99,
//     image: 'https://images.pexels.com/photos/5468022/pexels-photo-5468022.jpeg',
//     category: 'desserts',
//     dietary: ['vegetarian'],
//   },
//   {
//     id: '16',
//     name: 'New York Cheesecake',
//     description: 'Classic cheesecake with fresh berry compote',
//     price: 8.99,
//     image: 'https://images.pexels.com/photos/4686833/pexels-photo-4686833.jpeg',
//     category: 'desserts',
//     dietary: ['vegetarian'],
//   },
//   {
//     id: '17',
//     name: 'Tiramisu',
//     description: 'Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone',
//     price: 8.99,
//     image: 'https://images.pexels.com/photos/5419336/pexels-photo-5419336.jpeg',
//     category: 'desserts',
//     dietary: ['vegetarian'],
//   },

//   // Drinks
//   {
//     id: '18',
//     name: 'Fresh Lemonade',
//     description: 'House-made lemonade with mint and seasonal berries',
//     price: 4.99,
//     image: 'https://images.pexels.com/photos/3652041/pexels-photo-3652041.jpeg',
//     category: 'drinks',
//     dietary: ['vegan', 'gluten-free'],
//   },
//   {
//     id: '19',
//     name: 'Craft Iced Tea',
//     description: 'Organic black tea infused with peach and ginger',
//     price: 3.99,
//     image: 'https://images.pexels.com/photos/1194030/pexels-photo-1194030.jpeg',
//     category: 'drinks',
//     dietary: ['vegan', 'gluten-free'],
//   },
//   {
//     id: '20',
//     name: 'Italian Soda',
//     description: 'Sparkling water with your choice of fruit syrup',
//     price: 4.49,
//     image: 'https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg',
//     category: 'drinks',
//     dietary: ['vegan', 'gluten-free'],
//   },
// ];
export const menuData: MenuItem[] = [
{
    id: '1',
    category_id: '1',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/bbq_ckn.jpg?raw=true",
    name: "The Barbecue Chicken Pizza",
    price: 23.99,
    description: "Barbecued Chicken, Red Peppers, Green Peppers, Tomatoes, Red Onions, Barbecue Sauce"
},
{
    id: '2',
    category_id: '1',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/cali_ckn.jpg?raw=true",
    name: "The California Chicken Pizza",
    price: 23.99,
    description: "Chicken, Artichoke, Spinach, Garlic, Jalapeno Peppers, Fontina Cheese, Gouda Cheese"
},
{
    id: '3',
    category_id: '2',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/big_meat.jpg?raw=true",
    name: "The Big Meat Pizza",
    price: 28.50,
    description: "Bacon, Pepperoni, Italian Sausage, Chorizo Sausage"
},
{
    id: '4',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/calabrese.jpg?raw=true",
    name: "The Calabrese Pizza",
    price: 21.50,
    description: "Salami, Pancetta, Tomatoes, Red Onions, Friggitello Peppers, Garlic"
},
{
    id: '5',
    category_id: '1',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/cali_ckn.jpg?raw=true",
    name: "The California Chicken Pizza",
    price: 22.50,
    description: "Chicken, Artichoke, Spinach, Garlic, Jalapeno Peppers, Fontina Cheese, Gouda Cheese"
},
{
    id: '6',
    category_id: '1',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/ckn_alfredo.jpg?raw=true",
    name: "The Chicken Alfredo Pizza",
    price: 21.50,
    description: "Chicken, Red Onions, Red Peppers, Mushrooms, Asiago Cheese, Alfredo Sauce"
},
{
    id: '7',
    category_id: '1',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/ckn_pesto.jpeg?raw=true",
    name: "The Chicken Pesto Pizza",
    price: 23.50,
    description: "Chicken, Tomatoes, Red Peppers, Spinach, Garlic, Pesto Sauce"
},
{
    id: '8',
    category_id: '2',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/classicpizza.jpg?raw=true",
    name: "TThe Classic Deluxe Pizza",
    price: 20.90,
    description: "Pepperoni, Mushrooms, Red Onions, Red Peppers, Bacon"
},
{
    id: '9',
    category_id: '4',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/green_garden.jpg?raw=true",
    name: "The Green Garden Pizza",
    price: 20.90,
    description: "Spinach, Mushrooms, Tomatoes, Green Olives, Feta Cheese"
},
{
    id: '10',
    category_id: '2',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/hawaiian.jpg?raw=true",
    name: "The Hawaiian Pizza",
    price: 24.90,
    description: "Sliced Ham, Pineapple, Mozzarella Cheese"
},
{
    id: '11',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/ital_supr.jpg?raw=true",
    name: "The Italian Supreme Pizza",
    price: 20.60,
    description: "Calabrese Salami, Capocollo, Tomatoes, Red Onions, Green Olives, Garlic"
},
{
    id: '12',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/ital_veggie.jpg?raw=true",
    name: "The Italian Vegetables Pizza",
    price: 20.60,
    description: "Eggplant, Artichokes, Tomatoes, Zucchini, Red Peppers, Garlic, Pesto Sauce"
},
{
    id: '13',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/napolitana.jpg?raw=true",
    name: "The Napolitana Pizza",
    price: 22.60,
    description: "Tomatoes, Anchovies, Green Olives, Red Onions, Garlic"
},
{
    id: '14',
    category_id: '2',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/pep_msh_susage.jpeg?raw=true",
    name: "The Pepperoni Pizza",
    price: 19.60,
    description: "Pepperoni, Mushrooms, Green Peppers, Sausage"
},
{
    id: '15',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/peppr_salami.jpeg?raw=true",
    name: "The Pepper Salami Pizza",
    price: 23.60,
    description: "Genoa Salami, Capocollo, Pepperoni, Tomatoes, Asiago Cheese, Garlic"
},
{
    id: '16',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/sicilian.jpg?raw=true",
    name: "The Sicilian Pizza",
    price: 22.60,
    description: "Coarse Sicilian Salami, Tomatoes, Green Olives, Luganega Sausage, Onions, Garlic"
},
{
    id: '17',
    category_id: '3',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/soppressata.jpg?raw=true",
    name: "The Soppressata Pizza",
    price: 23.60,
    description: "Soppressata Salami, Fontina Cheese, Mozzarella Cheese, Mushrooms, Garlic"
},
{
    id: '18',
    category_id: '4',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/spin_pesto.jpeg?raw=true",
    name: "Spinach Pesto Pizza",
    price: 24.60,
    description: "Spinach, Artichokes, Tomatoes, Sun-dried Tomatoes, Garlic, Pesto Sauce"
},
{
    id: '19',
    category_id: '4',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/spin_pesto_spicy.jpg?raw=true",
    name: "Spinach and Feta Pizza",
    price: 21.60,
    description: "Spinach, Mushrooms, Red Onions, Feta Cheese, Garlic, Spicy"
},
{
    id: '20',
    category_id: '4',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/spinach_fet.jpg?raw=true",
    name: "The Four Cheese Pizza",
    price: 20.90,
    description: "Ricotta Cheese, Piccante Cheese, Mozzarella Cheese, Parmigiano Cheese, Garlic"
},
{
    id: '21',
    category_id: '4',
    image_url: "https://github.com/allen-assignment/backend/blob/main/dishpictures/veggie_veg.jpg?raw=true",
    name: "Double Vegetables Pizza",
    price: 18.90,
    description: "Mushrooms, Tomatoes, Red Peppers, Green Peppers, Red Onions, Zucchini, Spinach, Garlic"
}
]

export const categories = [
    { category_id: 'all', name: 'All' },
    { category_id: '1', name: 'Chicken' },
    { category_id: '2', name: 'Classic' },
    { category_id: '3', name: 'Supreme' },
    { category_id: '4', name: 'Veggie' },
];