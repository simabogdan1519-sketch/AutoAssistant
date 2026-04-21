import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { useStore } from '@/lib/store';
import { Colors } from '@/constants/theme';

export function CarSelector() {
  const router = useRouter();
  const cars = useStore((s) => s.cars);
  const activeCarId = useStore((s) => s.activeCarId);
  const setActiveCar = useStore((s) => s.setActiveCar);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {cars.map((car) => {
          const active = car.id === activeCarId;
          return (
            <TouchableOpacity
              key={car.id}
              onPress={() => setActiveCar(car.id)}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <View style={styles.avatarWrap}>
                {car.profileImage ? (
                  <Image source={{ uri: car.profileImage }} style={styles.avatarImg} />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      active && { borderColor: Colors.accent },
                    ]}
                  />
                )}
              </View>
              <Text
                variant="mono"
                size={11}
                tracking={0.8}
                color={active ? Colors.ink : Colors.inkDim}
                style={{ textTransform: 'uppercase' }}
              >
                {car.model || car.make}
              </Text>
              {active && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => router.push('/car/new')}
          activeOpacity={0.7}
          style={styles.tab}
        >
          <View style={styles.addBtn}>
            <Ionicons name="add" size={14} color={Colors.inkDim} />
          </View>
          <Text variant="mono" size={11} tracking={0.8} color={Colors.inkDim}>
            ADAUGĂ
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    marginBottom: 20,
  },
  row: {
    paddingVertical: 14,
    gap: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'relative',
  },
  avatarWrap: {
    width: 22,
    height: 22,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: Colors.surface3,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  avatarImg: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  addBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBar: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.accent,
  },
});
