import { Text, StyleSheet } from 'react-native';

const CustomText = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.defaultStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    color: '#ea2b2b', 
    fontSize: 16,
    opacity: 1,
    zIndex: 1,
    elevation: 0.1,
  },
});

export default CustomText;