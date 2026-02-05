import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Select } from '@/components/ui';

const MEAL_TYPES = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

export default function MealLogScreen() {
  const router = useRouter();
  const [mealType, setMealType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [showMacros, setShowMacros] = useState(false);

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Meal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Select
          label="Meal Type"
          placeholder="Select meal type"
          options={MEAL_TYPES}
          value={mealType}
          onValueChange={setMealType}
          testID="select-meal-type"
        />

        <Card style={styles.photoCard}>
          <TouchableOpacity style={styles.photoButton}>
            <Ionicons name="camera" size={32} color="#10B981" />
            <Text style={styles.photoText}>Add Photo (optional)</Text>
          </TouchableOpacity>
        </Card>

        <Input
          label="What did you eat?"
          placeholder="Describe your meal..."
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.descriptionInput}
          testID="input-meal-description"
        />

        <TouchableOpacity 
          style={styles.macroToggle}
          onPress={() => setShowMacros(!showMacros)}
        >
          <Text style={styles.macroToggleText}>Add nutrition details (optional)</Text>
          <Ionicons 
            name={showMacros ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#10B981" 
          />
        </TouchableOpacity>

        {showMacros && (
          <View style={styles.macroFields}>
            <View style={styles.macroRow}>
              <View style={styles.macroField}>
                <Input
                  label="Calories"
                  placeholder="0"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  testID="input-calories"
                />
              </View>
              <View style={styles.macroField}>
                <Input
                  label="Protein (g)"
                  placeholder="0"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  testID="input-protein"
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.quickMeals}>
          <Text style={styles.quickMealsTitle}>Quick Add</Text>
          <View style={styles.quickMealsGrid}>
            {['Protein Shake', 'Banana', 'Chicken & Rice', 'Salad'].map((meal) => (
              <TouchableOpacity key={meal} style={styles.quickMealChip}>
                <Text style={styles.quickMealText}>{meal}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Meal"
          onPress={handleSave}
          disabled={!mealType || !description}
          testID="button-save-meal"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  photoCard: {
    marginBottom: 16,
  },
  photoButton: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: '#E8F5F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  photoText: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 8,
  },
  descriptionInput: {
    minHeight: 100,
  },
  macroToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  macroToggleText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  macroFields: {
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroField: {
    flex: 1,
  },
  quickMeals: {
    marginTop: 8,
  },
  quickMealsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quickMealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickMealChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E8F5F0',
    borderRadius: 20,
  },
  quickMealText: {
    fontSize: 14,
    color: '#10B981',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
