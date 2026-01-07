import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { getTextColor, getSecondaryTextColor } from '../../../App';

interface ContentCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: any;
  contentClassName?: any;
  fullHeight?: boolean;
  headerActions?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControl>;
}

export default function ContentCard({
  title,
  description,
  children,
  className,
  contentClassName,
  fullHeight = false,
  headerActions,
  refreshControl,
}: ContentCardProps) {
  const colorScheme = useColorScheme();

  return (
    <Card style={[fullHeight && styles.fullHeight, className]} colorScheme={colorScheme}>
      {(title || description || headerActions) && (
        <CardHeader style={styles.header}>
          <View style={[styles.headerContent, !headerActions && styles.headerContentCentered]}>
            <View style={[styles.headerText, !headerActions && styles.headerTextCentered]}>
              {title && (
                <CardTitle colorScheme={colorScheme} style={{ color: '#a61612', textAlign: !headerActions ? 'center' : 'left' }}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription colorScheme={colorScheme}>
                  {description}
                </CardDescription>
              )}
            </View>
            {headerActions && (
              <View style={styles.headerActions}>
                {headerActions}
              </View>
            )}
          </View>
        </CardHeader>
      )}
      <ScrollView
        style={fullHeight ? styles.scrollView : undefined}
        contentContainerStyle={[styles.content, contentClassName]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  fullHeight: {
    flex: 1,
  },
  header: {
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerContentCentered: {
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginRight: 16,
  },
  headerTextCentered: {
    flex: 0,
    marginRight: 0,
    alignItems: 'center',
  },
  headerActions: {
    flexShrink: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 16,
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    color: '#a61612',
  },
});

