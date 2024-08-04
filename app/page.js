'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase'; // Ensure this path is correct
import { Box, Typography, Stack, Modal, Button, TextField } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// In your component file
import { fetchRecipeSuggestions } from '@/app/utils/generativeAI'; // Adjust the path as necessary


// Custom Dark Theme with Subtle Neon Glow Effect
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cyan color for primary elements
    },
    secondary: {
      main: '#ff4081', // Pink color for secondary elements
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: '0 0 10px rgba(0, 188, 212, 0.3)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)',
          },
        },
      },
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [recipes, setRecipes] = useState('');
  const [showRecipes, setShowRecipes] = useState(true);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await updateDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const recipePromises = inventory.map(async (item) => {
          const prompt = `Generate a detailed recipe using the following ingredient: ${item.name}. Format the recipe with proper headings and spacing as follows:
  
  **Title:** The recipe name.
  
  **Description:** A brief description of the dish.
  
  **Ingredients:** List each ingredient with its quantity on a new line.
  
  **Instructions:** Numbered list of steps for preparing the dish.
  
  **Cooking Time:** Total cooking time.
  
  **Serving Size:** Number of servings.
  
  **Dietary Information:** Any relevant notes about dietary restrictions (e.g., gluten-free, vegetarian).
  
  **Notes:** Additional tips or suggestions for the recipe.
  
  Ensure the response is well-structured with clear headings and line breaks.`;
  
          const generatedRecipe = await fetchRecipeSuggestions(prompt);
          return {
            ingredient: item.name,
            recipe: generatedRecipe,
          };
        });
  
        const recipesArray = await Promise.all(recipePromises);
        setRecipes(recipesArray);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
  
    if (inventory.length > 0 && showRecipes) {
      getRecipes();
    }
  }, [inventory, showRecipes]);
  

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        bgcolor="background.default"
        p={2}
        overflow="auto" // Ensure the whole page is scrollable
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{ transform: "translate(-50%, -50%)" }}
            width="400px"
            bgcolor="background.paper"
            border="2px solid #333"
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            boxShadow="0 0 20px rgba(0, 188, 212, 0.5)"
          >
            <Typography variant="h6" color="text.primary">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={1}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{
                  input: {
                    color: 'text.primary',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <Box border="1px solid #333" width="800px" borderRadius="8px">
          <Box
            width="100%"
            height="100px"
            bgcolor="primary.main"
            display="flex"
            justifyContent="center"
            alignItems="center"
            boxShadow="0 0 10px rgba(0, 188, 212, 0.3)"
          >
            <Typography variant="h2" color="text.primary">Pantry Items</Typography>
          </Box>
          <Stack width="100%" maxHeight="150px" spacing={1} overflow="auto" p={2}>
            {inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="60px" // Reduced minimum height
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="background.paper"
                padding={1}
                borderRadius="8px"
                boxShadow="0 0 10px rgba(0, 188, 212, 0.3)"
                sx={{
                  '&:hover': {
                    boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)',
                  },
                }}
              >
                <Box display="flex" flex="1" justifyContent="flex-start" >
                  <Typography variant="h5" color="text.primary">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                </Box>
                <Box display="flex" flex="1" justifyContent="center">
                  <Typography variant="h5" color="text.primary" textAlign="center">
                    {quantity}
                  </Typography>
                </Box>
                <Box display="flex" flex="1" justifyContent="flex-end">
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={() => addItem(name)}>
                      Add
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box width="800px" mt={4}>
  <Stack direction="row" spacing={2} mb={2} alignItems="center">
    <Button
      variant="contained"
      onClick={() => setShowRecipes(!showRecipes)}
    >
      {showRecipes ? 'Hide Recipes' : 'Show Recipes'}
    </Button>
    {showRecipes && (
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setRecipes([])}
        disabled={recipes.length === 0}
      >
        Clear Recipes
      </Button>
    )}
  </Stack>
  {showRecipes && (
    <Box
      border="1px solid #333"
      borderRadius="8px"
      padding={2}
      boxShadow="0 0 10px rgba(0, 188, 212, 0.3)"
      bgcolor="background.paper"
      maxHeight="200px"
      overflow="auto"
      position="relative"
      
    >
      {recipes.length === 0 ? (
        <Typography variant="body1" color="text.primary">
          No recipes to display.
        </Typography>
      ) : (
        recipes.map(({ ingredient, recipe }) => (
          <Box key={ingredient} mb={2}>
            <Typography variant="h6" color="text.primary">
              Recipes for {ingredient}:
            </Typography>
            <Typography variant="body1" color="text.primary" whiteSpace="pre-line">
              {recipe}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  )}
</Box>s
      </Box>
    </ThemeProvider>
  );
}
