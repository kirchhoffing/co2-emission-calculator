import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '22%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryUnit: {
    fontSize: 8,
    color: '#6b7280',
  },
  scopeSection: {
    marginBottom: 25,
  },
  scopeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  scopeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scopeTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  breakdownTable: {
    marginLeft: 15,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  tableCategory: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
  },
  tableAmount: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: 'bold',
    width: 80,
    textAlign: 'right',
  },
  recommendationsList: {
    marginTop: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 10,
    color: '#10b981',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
  changeIndicator: {
    fontSize: 10,
    marginTop: 3,
  },
  changePositive: {
    color: '#059669',
  },
  changeNegative: {
    color: '#dc2626',
  },
});

// Type definitions
interface EmissionData {
  company: {
    name: string;
    logo: string;
    address: string;
    reportPeriod: string;
    generatedDate: string;
  };
  summary: {
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
    yearOverYearChange: number;
    targetReduction: number;
  };
  scopes: {
    scope1: ScopeData;
    scope2: ScopeData;
    scope3: ScopeData;
  };
  recommendations: string[];
}

interface ScopeData {
  total: number;
  breakdown: {
    category: string;
    amount: number;
    unit: string;
  }[];
}

interface EmissionReportPDFProps {
  data: EmissionData;
}

export const EmissionReportPDF: React.FC<EmissionReportPDFProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 1, 
      maximumFractionDigits: 1 
    });
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'scope1': return '#ef4444';
      case 'scope2': return '#f59e0b';
      case 'scope3': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getScopeDescription = (scope: string) => {
    switch (scope) {
      case 'scope1': return 'Direct Emissions';
      case 'scope2': return 'Indirect Energy Emissions';
      case 'scope3': return 'Value Chain Emissions';
      default: return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Carbon Emission Report</Text>
            <Text style={styles.subtitle}>Annual Sustainability Report {data.company.reportPeriod}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1f2937' }}>
              {data.company.name}
            </Text>
            <Text>{data.company.address}</Text>
            <Text>Generated: {data.company.generatedDate}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Emissions</Text>
              <Text style={styles.summaryValue}>{formatNumber(data.summary.totalEmissions)}</Text>
              <Text style={styles.summaryUnit}>tCO2e</Text>
              <Text style={[
                styles.changeIndicator,
                data.summary.yearOverYearChange < 0 ? styles.changePositive : styles.changeNegative
              ]}>
                {data.summary.yearOverYearChange > 0 ? '+' : ''}{data.summary.yearOverYearChange}% YoY
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Scope 1</Text>
              <Text style={styles.summaryValue}>{formatNumber(data.summary.scope1)}</Text>
              <Text style={styles.summaryUnit}>tCO2e</Text>
              <Text style={[styles.changeIndicator, { color: '#ef4444' }]}>
                {((data.summary.scope1 / data.summary.totalEmissions) * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Scope 2</Text>
              <Text style={styles.summaryValue}>{formatNumber(data.summary.scope2)}</Text>
              <Text style={styles.summaryUnit}>tCO2e</Text>
              <Text style={[styles.changeIndicator, { color: '#f59e0b' }]}>
                {((data.summary.scope2 / data.summary.totalEmissions) * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Scope 3</Text>
              <Text style={styles.summaryValue}>{formatNumber(data.summary.scope3)}</Text>
              <Text style={styles.summaryUnit}>tCO2e</Text>
              <Text style={[styles.changeIndicator, { color: '#8b5cf6' }]}>
                {((data.summary.scope3 / data.summary.totalEmissions) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emission Sources Breakdown</Text>
          
          {Object.entries(data.scopes).map(([scopeKey, scopeData]) => (
            <View key={scopeKey} style={styles.scopeSection}>
              <View style={styles.scopeHeader}>
                <Text style={styles.scopeTitle}>
                  {scopeKey.toUpperCase()}: {getScopeDescription(scopeKey)}
                </Text>
                <Text style={[styles.scopeTotal, { color: getScopeColor(scopeKey) }]}>
                  {formatNumber(scopeData.total)} tCO2e
                </Text>
              </View>
              
              <View style={styles.breakdownTable}>
                {scopeData.breakdown.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCategory}>{item.category}</Text>
                    <Text style={styles.tableAmount}>{formatNumber(item.amount)} {item.unit}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reduction Recommendations</Text>
          
          <View style={styles.recommendationsList}>
            {data.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.bulletPoint}>●</Text>
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
          
          <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0369a1', marginBottom: 5 }}>
              2030 Target
            </Text>
            <Text style={{ fontSize: 11, color: '#0369a1' }}>
              Achieve {data.summary.targetReduction}% reduction in total emissions by 2030 
              (Target: {formatNumber(data.summary.totalEmissions * (1 - data.summary.targetReduction / 100))} tCO2e)
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by CO2 Emission Calculator • {data.company.name}
          </Text>
          <Text style={styles.pageNumber}>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
}; 