'use client';

import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { DashboardLayout } from 'ui/src/layout/DashboardLayout';
import { EmissionReportPDF } from '../components/EmissionReportPDF';

// Mock emission data structure - will be replaced with real data from tRPC
const mockEmissionData = {
  company: {
    name: 'Acme Corporation',
    logo: '/co2-main-logo.png',
    address: '123 Green Street, Eco City, EC 12345',
    reportPeriod: '2024',
    generatedDate: new Date().toLocaleDateString(),
  },
  summary: {
    totalEmissions: 2847.5,
    scope1: 1250.3,
    scope2: 890.7,
    scope3: 706.5,
    yearOverYearChange: -12.5, // percentage
    targetReduction: 25, // percentage by 2030
  },
  scopes: {
    scope1: {
      total: 1250.3,
      breakdown: [
        { category: 'Natural Gas', amount: 450.2, unit: 'tCO2e' },
        { category: 'Company Vehicles', amount: 320.8, unit: 'tCO2e' },
        { category: 'Diesel Generators', amount: 285.1, unit: 'tCO2e' },
        { category: 'Propane', amount: 194.2, unit: 'tCO2e' },
      ],
    },
    scope2: {
      total: 890.7,
      breakdown: [
        { category: 'Purchased Electricity', amount: 742.3, unit: 'tCO2e' },
        { category: 'Steam', amount: 89.2, unit: 'tCO2e' },
        { category: 'Heating', amount: 34.5, unit: 'tCO2e' },
        { category: 'Cooling', amount: 24.7, unit: 'tCO2e' },
      ],
    },
    scope3: {
      total: 706.5,
      breakdown: [
        { category: 'Business Travel', amount: 245.8, unit: 'tCO2e' },
        { category: 'Employee Commuting', amount: 198.3, unit: 'tCO2e' },
        { category: 'Upstream Transportation', amount: 156.2, unit: 'tCO2e' },
        { category: 'Waste Generated', amount: 87.4, unit: 'tCO2e' },
        { category: 'Downstream Transportation', amount: 18.8, unit: 'tCO2e' },
      ],
    },
  },
  recommendations: [
    'Switch to renewable energy sources for 30% emission reduction',
    'Implement remote work policy to reduce commuting emissions',
    'Optimize delivery routes to reduce transportation emissions',
    'Increase recycling programs to reduce waste emissions',
  ],
};

export default function ReportsPage() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Emission Reports</h1>
          <p className="text-gray-600 mt-2">
            Generate professional PDF reports of your emission calculations
          </p>
        </div>

        {/* Report Generation Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Annual Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Report Year</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="comprehensive">Comprehensive Report</option>
                <option value="executive">Executive Summary</option>
                <option value="compliance">Compliance Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Include Scopes</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Scope 1 (Direct)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Scope 2 (Indirect Energy)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Scope 3 (Value Chain)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showPreview ? 'Hide Preview' : 'Preview Report'}
            </button>
            
            <PDFDownloadLink
              document={<EmissionReportPDF data={mockEmissionData} />}
              fileName={`emission-report-${mockEmissionData.company.reportPeriod}.pdf`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF Report')}
            </PDFDownloadLink>
          </div>
        </div>

        {/* PDF Preview */}
        {showPreview && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Report Preview</h2>
            <div className="border rounded-lg overflow-hidden" style={{ height: '800px' }}>
              <PDFViewer width="100%" height="100%">
                <EmissionReportPDF data={mockEmissionData} />
              </PDFViewer>
            </div>
          </div>
        )}

        {/* Report History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          
          <div className="space-y-4">
            {[
              { name: 'Annual Emission Report 2024', date: '2024-12-15', size: '2.3 MB', status: 'Generated' },
              { name: 'Q3 Compliance Report 2024', date: '2024-10-01', size: '1.8 MB', status: 'Generated' },
              { name: 'Executive Summary 2024', date: '2024-09-15', size: '854 KB', status: 'Generated' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-gray-600">Generated on {report.date} • {report.size}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {report.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 