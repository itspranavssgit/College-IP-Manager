import { useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, useRequireAuth } from "@/utils/auth/useAuth";
import {
  Network,
  LayoutDashboard,
  Server,
  Monitor,
  Activity,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react-native";
import { useState } from "react";

export default function Index() {
  useRequireAuth();
  const insets = useSafeAreaInsets();
  const { isReady, auth } = useAuth();
  const [stats, setStats] = useState({
    totalIPs: 0,
    allocatedIPs: 0,
    freeIPs: 0,
    activeDevices: 0,
    totalLabs: 0,
    totalBuildings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch("/api/dashboard/stats", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to fetch dashboard data`,
          );
        }
        const data = await response.json();

        setStats(data.stats);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);

        // Set fallback data if API fails
        if (err.name === "AbortError") {
          setError("Request timeout - please check your connection");
        } else {
          setError(err.message);
        }

        // Provide fallback stats so the app is still usable
        setStats({
          totalIPs: 0,
          allocatedIPs: 0,
          freeIPs: 0,
          activeDevices: 0,
          totalLabs: 0,
          totalBuildings: 0,
        });
        setLoading(false);
      }
    };

    // Only fetch if we have a user
    if (auth?.user) {
      fetchDashboardData();
    } else if (isReady && !auth?.user) {
      // If auth is ready but no user, stop loading
      setLoading(false);
    }
  }, [auth, isReady]);

  if (!isReady || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#263043",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#00D1FF" />
        <Text style={{ color: "white", marginTop: 16, fontSize: 16 }}>
          Loading Network Manager...
        </Text>
      </View>
    );
  }

  if (!auth) {
    return null;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#263043",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
          padding: 20,
        }}
      >
        <StatusBar style="light" />
        <AlertTriangle size={48} color="#F59E0B" />
        <Text
          style={{
            color: "#F59E0B",
            marginTop: 16,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          Error loading data
        </Text>
        <Text
          style={{
            color: "#9CA3AF",
            marginTop: 8,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color = "#00D1FF" }) => (
    <View
      style={{
        backgroundColor: "#2D384E",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#37425B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ color: color, fontSize: 28, fontWeight: "bold" }}>
          {value}
        </Text>
      </View>
      <Icon size={32} color={color} />
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "#263043", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#232D41",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#37425B",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Network size={24} color="#00D1FF" />
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 12,
          }}
        >
          Network Manager
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Dashboard Overview
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 16 }}>
            Welcome back, {auth.user?.email?.split("@")[0] || "Admin"}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            Network Statistics
          </Text>

          <StatCard
            icon={Server}
            title="Total IP Addresses"
            value={stats.totalIPs.toString()}
            color="#00D1FF"
          />

          <StatCard
            icon={CheckCircle}
            title="Allocated IPs"
            value={stats.allocatedIPs.toString()}
            color="#10B981"
          />

          <StatCard
            icon={Activity}
            title="Active Devices"
            value={stats.activeDevices.toString()}
            color="#10B981"
          />

          <StatCard
            icon={Monitor}
            title="Free IP Addresses"
            value={stats.freeIPs.toString()}
            color="#F59E0B"
          />
        </View>

        {/* Quick Info */}
        <View
          style={{
            backgroundColor: "#2D384E",
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: "#37425B",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            Infrastructure Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>Buildings</Text>
            <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
              {stats.totalBuildings}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              Labs & Classrooms
            </Text>
            <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
              {stats.totalLabs}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
              Utilization Rate
            </Text>
            <Text style={{ color: "#00D1FF", fontSize: 14, fontWeight: "500" }}>
              {stats.totalIPs > 0
                ? Math.round((stats.allocatedIPs / stats.totalIPs) * 100)
                : 0}
              %
            </Text>
          </View>
        </View>

        {/* Status Indicators */}
        <View
          style={{
            backgroundColor: "#2D384E",
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: "#37425B",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 16,
            }}
          >
            System Status
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <CheckCircle size={16} color="#10B981" />
            <Text style={{ color: "#10B981", fontSize: 14, marginLeft: 8 }}>
              All IP pools operational
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <CheckCircle size={16} color="#10B981" />
            <Text style={{ color: "#10B981", fontSize: 14, marginLeft: 8 }}>
              Network connectivity stable
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Activity size={16} color="#00D1FF" />
            <Text style={{ color: "#00D1FF", fontSize: 14, marginLeft: 8 }}>
              {stats.activeDevices} devices currently active
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
