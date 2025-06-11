import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

export default function Analytics() {
  // Static analytics data - no database calls needed
  const stats = {
    totalQuestionsSolved: 1247,
    totalCorrectAnswers: 1098
  };

  const accuracy = Math.round((stats.totalCorrectAnswers / stats.totalQuestionsSolved) * 100);

  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-gray-400">Track your performance and improvement</p>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 mb-6">
        {/* Weekly Performance Chart */}
        <Card className="glass-morphism">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Weekly Performance</CardTitle>
              <Select defaultValue="7days">
                <SelectTrigger className="w-32 glass-morphism">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-300">Performance Chart</p>
                <p className="text-sm text-gray-400">Recharts integration needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg glass-morphism">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Physics - Mechanics</p>
                    <p className="text-sm text-gray-400">Completed 3 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">18/20</div>
                  <div className="text-sm text-gray-400">90% Score</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glass-morphism">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Biology - Genetics</p>
                    <p className="text-sm text-gray-400">Completed 6 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">16/20</div>
                  <div className="text-sm text-gray-400">80% Score</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glass-morphism">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Chemistry - Organic</p>
                    <p className="text-sm text-gray-400">Completed 1 day ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-400">14/20</div>
                  <div className="text-sm text-gray-400">70% Score</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-morphism">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{accuracy}%</div>
              <p className="text-sm text-gray-400">Overall Accuracy</p>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalQuestionsSolved.toLocaleString()}</div>
              <p className="text-sm text-gray-400">Questions Solved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}